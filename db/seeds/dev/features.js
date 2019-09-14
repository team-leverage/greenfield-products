const lineByLine = require('line-by-line');
const fs = require('fs');
const NULLPLACEHOLDER = 'NULLNULL';
const url = `./data/Features/features.part00.csv`;

var isCheckUniqueError = function (err) {
  return err.message.includes('duplicate');
}

var insertFeature = function(knex, hasHeader = true) {
  let isFirstLine = true, thisLine = 1, numUniqueLines = 0;
  return new Promise(function () {
    let rl = new lineByLine(url);
    // beginning of rl.on('line') block
    rl.on('line', function(line) {
      if (isFirstLine && hasHeader) {
        console.log('Starting To Load CSV into Database');
        isFirstLine = false;
        return;
      }
      let [id, product_id, feature_name, feature_value] = JSON.parse(`[${line}]`);
      feature_value = feature_value || NULLPLACEHOLDER;
      let feature_name_id_closure;
      return Promise.all([
        // insert into 1st table:  feature names
        knex('feature_names').insert({feature_name}, 'feature_name_id')
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if feature_name duplicate error, select from existing
              return knex('feature_names').where('feature_name', feature_name).select('feature_name_id').then((selectObj) => {
                return selectObj[0]['feature_name_id'];
              })
            } else {  // if the error is another error
              console.log(`PROBLEM LINE FOR FEATURE-NAMES ${thisLine}: ${line}`, err)
            }
          })
          // insert into 2nd table:  feature_values
          .then((feature_name_id) => {
            feature_name_id_closure = Number(feature_name_id);
            return knex('feature_values').insert({
              feature_name_id: feature_name_id_closure,
              feature_value: feature_value
            }, 'feature_value_id')
          })
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if value and feature name exists, select from existing
              return knex('feature_values').where({
                feature_name_id: feature_name_id_closure,
                feature_value: feature_value
              }).select('feature_value_id').then((selectObj) => {
                return selectObj[0]['feature_value_id'];
              })
            } else{
              console.log(`PROBLEM LINE FOR FEATURE-VALUE ${thisLine}: ${line}`, err);
            }
          })
          // insert into 3rd table:  product_feature_join
          .then((feature_value_id) => {
            return knex('product_feature_join').insert({
              product_id,
              feature_value_id: Number(feature_value_id)
            })
          })
          .catch((err) => {
            if (!isCheckUniqueError(err)) { // if the error is NOT related to unique contraints for products
              console.log(`PROBLEM LINE FOR FEATURE-JOIN ${thisLine}: ${line}`, err.message);
            } else {
              numUniqueLines++;
            }
          })
          .then(Promise.resolve())
      ])
      .then(() => {
        if (thisLine % 25000 === 0) { console.log(`Finished ${thisLine} items! So far ${numUniqueLines} duplicates.`); }
        thisLine++;
      })
      .catch(((err) => {console.log(err)}))
    });
    // end of rl.on('line') block
    rl.on('end', () => {
      console.log('DONE!!');
      rl.close();
    });
  })
}

exports.seed = function(knex) {
  // return insertFeature(knex, false)
  // .then(() => {
  //   console.log('Destroying connection pools');
  //   knex.destroy();
  // })
  return knex('product_feature_join').del()
    .then(() => {
      return knex('feature_values').del();
    })
    .then(() => {
      return knex('feature_names').del();
    })
    .then(() => {return insertFeature(knex, false)})
    .then(() => {
      console.log('Destroying connection pools');
      knex.destroy();
    })
};
