const fs = require('fs');
const lineByLineReader = require('line-by-line');
const path = require('path');

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'han',
  host: 'localhost',
  database: 'greenfield',
  password: 'face468a',
  port: 5432
});



const loadProducts = (req, res) => {
  const productCsv = new lineByLineReader(`./data/product.csv`);
  productCsv.on('line', (line) => {
    console.log(line);
  });
  productCsv.on('end', () => {});
}

// const exampleInsert = (req, res) => {
//   pool.query('INSERT INTO categories (category_name) VALUES ($1)', ['Basketball Shoes'], (err, res) => {
//     if (err) {
//       throw err;
//     }
//     res.status(200).send(`Category added to categories table`)
//   });
//   pool.query('SELECT * FROM categories', (error, results) => {
//     if (error) {
//       throw error
//     }
//     res.status(200).json(results.rows)
//   })
// }

module.exports = {loadProducts}