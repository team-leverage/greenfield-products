/* eslint-disable camelcase, no-plusplus */
const lineByLine = require('line-by-line');

const url = './data/Related/related.part03';
const { isCheckUniqueError, isCheckPoolError } = require('../../../util/util');

const insertRelated = function (knex, url, hasHeader = true) {
  let isFirstLine = true;
  let thisReadLine = 0;
  let thisEndLine;
  let thisQueryLine = 1;
  let numDuplicateLines = 0;
  let numProductZeroReferences = 0;
  let numPoolErrors = 0;
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
      const [id, product_id, related_product_id] = JSON.parse(`[${line}]`);
      return Promise.all([
        // insert into related_products table
        knex('related_products').insert({
          product_id: Number(product_id),
          related_product_id: Number(related_product_id),
        })
          .catch((err) => {
            if (Number(product_id) * Number(related_product_id) === 0) { // if error is referencing ProductID 0
              numProductZeroReferences++;
            } else if (isCheckUniqueError(err)) { // if duplicate error, select from existing
              numDuplicateLines++;
            } else if (isCheckPoolError(err)) {
              numPoolErrors++;
            } else { // if the error is another error
              console.log(`PROBLEM LINE FOR RELATED ${thisQueryLine}: ${line}`, err);
            }
          }),
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
  return insertRelated(knex, url, false);
  // return knex('related_products').del()
  //   .then(() => {return insertRelated(knex, url, true)})
};
