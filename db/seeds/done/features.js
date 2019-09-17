/* eslint-disable camelcase, no-plusplus */
const lineByLine = require('line-by-line');

const NULLPLACEHOLDER = 'NULLNULL';
const url = './data/Features/features.part00.csv';
const { isCheckUniqueError, isCheckPoolError } = require('../../../util/util');

const insertFeature = function (knex, url, hasHeader = true) {
  let isFirstLine = true;
  let thisReadLine = 0;
  let thisEndLine;
  let thisQueryLine = 1;
  let numDuplicateLines = 0;
  let numPoolErrorsNames = 0;
  let numPoolErrorsValues = 0;
  let numPoolErrorsJoin = 0;
  return new Promise(((resolveOuterPromise) => {
    const rl = new lineByLine(url);
    // beginning of rl.on('line') block
    rl.on('line', (line) => {
      thisReadLine++;
      if (isFirstLine && hasHeader) {
        console.log('Starting To Load CSV into Database');
        isFirstLine = false;
        thisQueryLine++;
        return;
      }
      let [id, product_id, feature_name, feature_value] = JSON.parse(`[${line}]`);
      feature_value = feature_value || NULLPLACEHOLDER;
      let feature_name_id_closure;
      return Promise.all([
        // insert into 1st table:  feature names
        knex('feature_names').insert({ feature_name }, 'feature_name_id')
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if feature_name duplicate error, select from existing
              return knex('feature_names').where('feature_name', feature_name).select('feature_name_id').then((selectObj) => selectObj[0].feature_name_id);
            } if (isCheckPoolError(err)) {
              numPoolErrorsNames++;
            } else { // if the error is another error
              console.log(`PROBLEM LINE FOR FEATURE-NAMES ${thisQueryLine}: ${line}`, err);
            }
          })
          // insert into 2nd table:  feature_values
          .then((feature_name_id) => {
            feature_name_id_closure = Number(feature_name_id);
            return knex('feature_values').insert({
              feature_name_id: feature_name_id_closure,
              feature_value,
            }, 'feature_value_id');
          })
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if value and feature name exists, select from existing
              return knex('feature_values').where({
                feature_name_id: feature_name_id_closure,
                feature_value,
              }).select('feature_value_id').then((selectObj) => selectObj[0].feature_value_id);
            } if (isCheckPoolError(err)) {
              numPoolErrorsValues++;
            } else {
              console.log(`PROBLEM LINE FOR FEATURE-VALUE ${thisQueryLine}: ${line}`, err);
            }
          })
          // insert into 3rd table:  product_feature_join
          .then((feature_value_id) => knex('product_feature_join').insert({
            product_id,
            feature_value_id: Number(feature_value_id),
          }))
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if the error is related to products unique contraints
              numDuplicateLines++;
            } else if (isCheckPoolError(err)) {
              numPoolErrorsJoin++;
            } else {
              console.log(`PROBLEM LINE FOR FEATURE-JOIN ${thisQueryLine}: ${line}`, err.message);
            }
          }),
      ])
        .then(() => {
          if (thisQueryLine % 25000 === 0) {
            console.log(`Finished ${thisQueryLine} items! So far ${numDuplicateLines} duplicates.  \
          Pool Errors: ${numPoolErrorsNames} feature_names, ${numPoolErrorsValues} feature_values, ${numPoolErrorsJoin} product_feature_join`);
          }
          if (thisQueryLine === thisEndLine) {
            console.log('DONE! Destroying connection pools');
            knex.destroy();
            resolveOuterPromise();
          }
          thisQueryLine++;
        })
        .catch(((err) => { console.log(err); }));
    });
    // end of rl.on('line') block
    rl.on('end', () => {
      thisEndLine = thisReadLine;
      console.log('Reading Finished, closing file...');
      rl.close();
    });
  }));
};

exports.seed = function (knex) {
  // return insertFeature(knex, false)
  return knex('product_feature_join').del()
    .then(() => knex('feature_values').del())
    .then(() => knex('feature_names').del())
    .then(() => insertFeature(knex, url, false));
};
