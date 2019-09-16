const lineByLine = require('line-by-line');
const url = `./data/Related/related.part03`;
const {isCheckUniqueError, isCheckPoolError} = require('../../../util/util');

var insertRelated = function(knex, url, hasHeader = true) {
  let isFirstLine = true, thisReadLine = 0, thisEndLine, thisQueryLine = 1, numDuplicateLines = 0, numProductZeroReferences = 0, numPoolErrors = 0;
  return new Promise(function (resolveOuterPromise) {
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
      let [id, product_id, related_product_id] = JSON.parse(`[${line}]`);
      return Promise.all([
        // insert into related_products table
        knex('related_products').insert({
          product_id: Number(product_id),
          related_product_id: Number(related_product_id)
        })
        .catch((err) => {
          if (Number(product_id) * Number(related_product_id) === 0) { // if error is referencing ProductID 0
            numProductZeroReferences++;
          } else if (isCheckUniqueError(err)) { // if duplicate error, select from existing
            numDuplicateLines++;
          } else if (isCheckPoolError(err)){
            numPoolErrors++;
          } else {  // if the error is another error
            console.log(`PROBLEM LINE FOR RELATED ${thisQueryLine}: ${line}`, err)
          }
        })
      ])
      .then(() => {
        if (thisQueryLine % 25000 === 0) { 
          console.log(`Finished ${thisQueryLine} items!  So far ${numDuplicateLines} duplicates, ${numPoolErrors} pool errors, \
          and ${numProductZeroReferences} references to ProductID 0.`); 
        }
        if (thisQueryLine === thisEndLine) {
          console.log('DONE! Destroying connection pools');
          knex.destroy();
          resolveOuterPromise();
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
  return insertRelated(knex, url, false)
  // return knex('related_products').del()
  //   .then(() => {return insertRelated(knex, url, true)})
};
