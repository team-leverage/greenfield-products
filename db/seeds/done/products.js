const lineByLine = require('line-by-line');
const url = `./data/Products/product.csv`;
const {isCheckUniqueError, isCheckPoolError} = require('../../../util/util');

var insertProduct = function(knex, url, hasHeader = true) {
  let isFirstLine = true, thisReadLine = 0, thisEndLine, thisQueryLine = 1, numDuplicateLines = 0, numPoolErrorsCategories = 0, numPoolErrorsProducts = 0;
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
      let [id, name, slogan, description, category, default_price] = JSON.parse(`[${line}]`);
      return Promise.all([
        knex('categories').insert({category_name: category}, 'category_id')
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if category duplicate error, select from existing
              return knex('categories').where('category_name', category).select('category_id').then((selectObj) => {
                return selectObj[0]['category_id'];
              })
            } else if (isCheckPoolError(err)){
              numPoolErrorsCategories++;
            } else {  // if the error is another error
              console.log(`PROBLEM LINE FOR CATEGORIES ${thisQueryLine}: ${line}`, err)
            }
          })
          .then((category_id) => {
            return knex('products').insert({
              product_id: Number(id),
              product_name: name,
              slogan: slogan,
              product_description: description,
              category_id: Number(category_id),
              default_price: Number(default_price)
            })
          })
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if the error is related to unique contraints for products
              numDuplicateLines++;
            } else if (isCheckPoolError(err)){
              numPoolErrorsProducts++;
            } else{
              console.log(`PROBLEM LINE FOR PRODUCTS ${thisQueryLine}: ${line}`, err);
            }
          })
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
  // Deletes ALL existing entries
  return knex('products').del()
    .then(() => {
      return knex('categories').del();
    })
    .then(() => {return insertProduct(knex, url, true)})
};
