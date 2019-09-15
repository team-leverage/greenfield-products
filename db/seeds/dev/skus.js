const lineByLine = require('line-by-line');
const url = `./data/Skus/skus.csv`;

var isCheckUniqueError = function (err) {
  return err.message.includes('duplicate');
}

var insertStyles = function(knex, url, hasHeader = true) {
  let isFirstLine = true, thisReadLine = 0, thisEndLine, thisQueryLine = 1, numDuplicateLines = 0;
  return new Promise(function () {
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
      let [id, product_id, style_name, sale_price, original_price, is_default] = JSON.parse(`[${line}]`);
      return Promise.all([
        // insert into styles table
        knex('styles').insert({
          style_id: Number(id),
          product_id: Number(product_id),
          style_name,
          sale_price: Number(sale_price || 0),
          original_price: Number(original_price || 0),
          is_default: is_default
        })
        .catch((err) => {
          if (isCheckUniqueError(err)) { // if duplicate error, select from existing
            numDuplicateLines++;
          } else {  // if the error is another error
            console.log(`PROBLEM LINE FOR STYLES ${thisQueryLine}: ${line}`, err)
          }
        })
        .then(Promise.resolve())
      ])
      .then(() => {
        if (thisQueryLine % 25000 === 0) { 
          console.log(`Finished ${thisQueryLine} items!  So far ${numDuplicateLines} duplicates.`); 
        }
        if (thisQueryLine === thisEndLine) {
          console.log('DONE! Destroying connection pools');
          knex.destroy();
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
  return insertStyles(knex, url, false);
  // return knex('styles').del()
  //   .then(() => {return insertStyles(knex, url, true)})
};
