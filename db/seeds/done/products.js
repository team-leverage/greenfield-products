/* eslint-disable camelcase, no-plusplus, consistent-return */
const LineByLine = require('line-by-line');

const url = './data/Products/product.csv';
const { isCheckUniqueError, isCheckPoolError } = require('../../../util/util');

const insertProduct = function (knex, seedFilePath, hasHeader = true) {
  let isFirstLine = true;
  let thisReadLine = 0;
  let thisEndLine;
  let thisQueryLine = 1;
  let numDuplicateLines = 0;
  let numPoolErrorsCategories = 0;
  let numPoolErrorsProducts = 0;
  return new Promise(((resolveOuterPromise) => {
    const rl = new LineByLine(seedFilePath);
    // beginning of rl.on('line') block
    rl.on('line', (line) => {
      thisReadLine++;
      if (isFirstLine && hasHeader) {
        console.log('Starting To Load CSV into Database');
        isFirstLine = false;
        thisQueryLine++;
        return;
      }
      const [id, name, slogan, description, category, default_price] = JSON.parse(`[${line}]`);
      return Promise.all([
        knex('categories').insert({ category_name: category }, 'category_id')
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if category duplicate error, select from existing
              return knex('categories').where('category_name', category).select('category_id').then((selectObj) => selectObj[0].category_id);
            } if (isCheckPoolError(err)) {
              numPoolErrorsCategories++;
            } else { // if the error is another error
              console.log(`PROBLEM LINE FOR CATEGORIES ${thisQueryLine}: ${line}`, err);
            }
          })
          .then((category_id) => knex('products').insert({
            product_id: Number(id),
            product_name: name,
            slogan,
            product_description: description,
            category_id: Number(category_id),
            default_price: Number(default_price),
          }))
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if the error is about unique contraints for products
              numDuplicateLines++;
            } else if (isCheckPoolError(err)) {
              numPoolErrorsProducts++;
            } else {
              console.log(`PROBLEM LINE FOR PRODUCTS ${thisQueryLine}: ${line}`, err);
            }
          }),
      ])
        .then(() => {
          if (thisQueryLine % 25000 === 0) {
            console.log(`Finished ${thisQueryLine} items!  So far ${numDuplicateLines} duplicates. \
          Pool Errors: ${numPoolErrorsCategories} categories, ${numPoolErrorsProducts} products.`);
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
  // Deletes ALL existing entries
  return knex('products').del()
    .then(() => knex('categories').del())
    .then(() => insertProduct(knex, url, true));
};
