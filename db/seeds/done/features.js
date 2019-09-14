const lineByLine = require('line-by-line');
const NULLPLACEHOLDER = 'NULLNULL';
const url = `./data/Features/features.part00.csv`;

var isCheckUniqueError = function (err) {
  return err.message.includes('duplicate');
}

var insertFeature = function(knex, url, hasHeader = true) {
  let isFirstLine = true, thisReadLine = 0, thisEndLine, thisQueryLine = 1, numDuplicateLines = 0;
  return new Promise(function () {
    let rl = new lineByLine(url);
    // beginning of rl.on('line') block
    rl.on('line', function(line) {
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
        knex('feature_names').insert({feature_name}, 'feature_name_id')
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if feature_name duplicate error, select from existing
              return knex('feature_names').where('feature_name', feature_name).select('feature_name_id').then((selectObj) => {
                return selectObj[0]['feature_name_id'];
              })
            } else {  // if the error is another error
              console.log(`PROBLEM LINE FOR FEATURE-NAMES ${thisQueryLine}: ${line}`, err)
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
              console.log(`PROBLEM LINE FOR FEATURE-VALUE ${thisQueryLine}: ${line}`, err);
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
            if (isCheckUniqueError(err)) { // if the error is related to unique contraints for products
              numDuplicateLines++;
            } else {
              console.log(`PROBLEM LINE FOR FEATURE-JOIN ${thisQueryLine}: ${line}`, err.message);
            }
          })
          .then(Promise.resolve())
      ])
      .then(() => {
        if (thisQueryLine % 25000 === 0) { 
          console.log(`Finished ${thisQueryLine} items! So far ${numDuplicateLines} duplicates.`); 
        }
        if (thisQueryLine === thisEndLine) {
          console.log('DONE! Destroying connection pools');
          knex.destroy();
        }
        thisQueryLine++;
      })
      .catch(((err) => {console.log(err)}))
    });
    // end of rl.on('line') block
    rl.on('end', () => {
      thisEndLine = thisReadLine;
      console.log('Reading Finished, closing file...');
      rl.close();
    });
  })
}

exports.seed = function(knex) {
  // return insertFeature(knex, false)
  return knex('product_feature_join').del()
    .then(() => {
      return knex('feature_values').del();
    })
    .then(() => {
      return knex('feature_names').del();
    })
    .then(() => {return insertFeature(knex, url, false)})
};
