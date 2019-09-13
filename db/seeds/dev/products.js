
const readLine = require('readline');
const fs = require('fs');
const url = `./data/product.csv`;

var insertProduct = function(knex) {
  return new Promise(function () {
    let isFirstLine = true, thisLine = 1;
    let rl = readLine.createInterface({
      input: fs.createReadStream(url)
    });
    rl.on('line', function(line) {
      if (isFirstLine) {
        console.log('Starting To Load CSV into Database');
        isFirstLine = false;
        return;
      }
      let [id, name, slogan, description, category, default_price] = JSON.parse(`[${line}]`);
      if (thisLine % 50000 === 0) { console.log(`Finished ${thisLine} items!`); }
      thisLine ++;
      return Promise.all([
        knex('categories').insert({category_name: category}, 'category_id')
          .catch(() => { // if category duplicate error, select from existing
            return knex('categories').where('category_name', category).select('category_id').then((selectObj) => {
              return selectObj[0]['category_id'];
            })
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
          .catch((err) => {})
      ])
      // .then(() => id)
      .catch(((err) => {console.log(err)}))
    });
    rl.on('close', () => console.log('DONE!!'));
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
