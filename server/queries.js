const lineByLineReader = require('line-by-line');
const knex = require('knex');

var greenfield = knex({
  client: 'pg',
  version: '7.12',
  connection: {
    host: 'localhost',
    user: 'han',
    password: 'face468a',
    database: 'greenfield',
    port: 5432
  },
  searchPath: ['knex', 'public'],
});



// const Pool = require('pg').Pool;
// const greenfield = new Pool({
//   user: 'han',
//   host: 'localhost',
//   database: 'greenfield',
//   password: 'face468a',
//   port: 5432
// });

const loadProducts = () => {
  const productCsv = new lineByLineReader(`./data/babyproduct.csv`);
  console.log(productCsv);
  var errors = [], isFirstLine = true, category_id;
  productCsv.on('line', (line) => {
    if (isFirstLine) {
      console.log('Starting To Load Products');
      isFirstLine = false;
      return;
    }
    var [id, name, slogan, description, category, default_price] = JSON.parse(`[${line}]`);
    console.log(category);
    greenfield.insert([{
      category_name: category
    }]).into('categories');
    
    // greenfield('products').insert({
    //   product_id: id,
    //   product_name: name,
    //   slogan: slogan,
    //   product_description: description,
    //   default_price: default_price
    // });

    // greenfield.query('INSERT INTO categories (category_name) VALUES ($1) ON CONFLICT DO NOTHING', [category]);
    // greenfield.query('INSERT INTO products (product_id, product_name, slogan, product_description, default_price) VALUES ($1, $2, $3, $4, $5)', 
    // [id, name, slogan, description, default_price]);
    // greenfield.query('UPDATE products SET (category_id = )\
    //   SELECT (category_id) FROM categories WHERE (category_name = $1)', [category]);
  });
  productCsv.on('error', (err) => {
    errors.push(err);
  });
  productCsv.on('end', () => {
    console.log('DONE!')
  });
}



module.exports = {loadProducts}