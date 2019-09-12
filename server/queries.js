const fs = require('fs');
const lineReader = require('line-reader');
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
  console.log('Reached here');
  var numLines = 0;
  lineReader.eachLine(`./data/product.csv`, (line) => {
    if (numLines > 10) { return; }
    console.log(line);
    numLines++;
  });
  // fs.readFile()
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