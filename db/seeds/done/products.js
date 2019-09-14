const lineByLine = require('line-by-line');
const fs = require('fs');
const url = `./data/Products/product.csv`;

var isCheckUniqueError = function (err) {
  return err.message.includes('duplicate');
}

// var multipleTries = function (arg, func, maxTries = 7, thisTry = 0) {
//   try {
//     return func(arg);
//   } catch(err) {
//     if (thisTry === maxTries) {
//       throw err;
//     }
//     multipleTries(arg, func, maxTries, thisTry+1)
//   }
// };

var insertProduct = function(knex) {
  let isFirstLine = true, thisLine = 1, numUniqueLines = 0;
  return new Promise(function () {
    let rl = new lineByLine(url);
    // beginning of rl.on('line') block
    rl.on('line', function(line) {
      if (isFirstLine) {
        console.log('Starting To Load CSV into Database');
        isFirstLine = false;
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
            } else {  // if the error is another error
              console.log(`PROBLEM LINE FOR CATEGORIES ${thisLine}: ${line}`, err)
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
              numUniqueLines++;
            } else{
              console.log(`PROBLEM LINE FOR PRODUCTS ${thisLine}: ${line}`, err);
            }
          })
          .then(Promise.resolve())
      ])
      .then(() => {
        if (thisLine % 25000 === 0) { console.log(`Finished ${thisLine} items!  So far ${numUniqueLines} duplicates.`); }
        thisLine++;
      })
      .catch(((err) => {console.log(err)}))
    });
    // end of rl.on('line') block
    rl.on('end', () => {
      console.log('DONE!!');
    });
  })
}

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('products').del()
    .then(() => {
      return knex('categories').del();
    })
    .then(() => {return insertProduct(knex)})
    .then(() => {
      console.log('Destroying connection pools');
      knex.destroy();
    })
};
