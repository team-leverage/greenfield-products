const lineByLine = require('line-by-line');
const fs = require('fs');
const url = `./data/babyproduct.csv`;

var isCheckUniqueError = function (err) {
  return err.routine.includes('unique');
}

var insertProduct = function(knex) {
  return new Promise(function () {
    let isFirstLine = true, thisLine = 1;
    let rl = new lineByLine(url);
    rl.on('line', function(line) {
      if (isFirstLine) {
        console.log('Starting To Load CSV into Database');
        isFirstLine = false;
        return;
      }
      let [id, name, slogan, description, category, default_price] = JSON.parse(`[${line}]`);
      if (thisLine % 25000 === 0) { console.log(`Finished ${thisLine} items!`); }
      thisLine ++;
      return Promise.all([
        knex('categories').insert({category_name: category}, 'category_id')
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if category duplicate error, select from existing
              return knex('categories').where('category_name', category).select('category_id').then((selectObj) => {
                return selectObj[0]['category_id'];
              })
            } else {  // if the error is another error
              console.log(`PROBLEM LINE FOR CATEGORIES ${thisLine}: ${line}`)
            }
          })
          .then((category_id) => {
            // console.log(`Inserted ${name} with category ${category_id}`);
            return knex('products').insert({
              product_id: Number(id),
              product_name: name,
              slogan: slogan,
              product_description: description,
              category_id: Number(JSON.parse(category_id)),
              default_price: Number(default_price)
            })
          })
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if the error is related to unique contraints for products
              console.log(`DUPLICATE PRODUCT ${name}`);
            } else{
              console.log(`PROBLEM LINE FOR PRODUCTS ${thisLine}: ${line}`);
            }
          })
      ])
      // .then(() => id)
      .catch(((err) => {console.log(err)}))
    });
    rl.on('end', () => console.log('DONE!!'));
  })
}

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('products').del()
    .then(() => {
      return knex('categories').del();
    })
    .then(() => {return insertProduct(knex)})
    .then(() => {console.log('Completed Insert!')})
};
