const lineByLine = require('line-by-line');
const url = `./data/Related/related.part03`;

var isCheckUniqueError = function (err) {
  return err.message.includes('duplicate');
}

var insertRelated = function(knex, url, hasHeader = true) {
  let isFirstLine = true, thisLine = 1, numUniqueLines = 0, numProductZeroReferences = 0;
  return new Promise(function () {
    let rl = new lineByLine(url);
    // beginning of rl.on('line') block
    rl.on('line', function(line) {
      if (isFirstLine && hasHeader) {
        console.log('Starting To Load CSV into Database');
        isFirstLine = false;
        return;
      }
      let [id, product_id, related_product_id] = JSON.parse(`[${line}]`);
      return Promise.all([
        // insert into related_products table
        knex('related_products').insert({
          product_id: Number(product_id),
          related_product_id: Number(related_product_id)
        })
        .catch((err) => {
          if (Number(product_id) * Number(related_product_id) === 0) { // if error is referencing ProductID 0
            numProductZeroReferences++;
          } else if (isCheckUniqueError(err)) { // if duplicate error, select from existing
            numUniqueLines++;
          } else {  // if the error is another error
            console.log(`PROBLEM LINE FOR RELATED ${thisLine}: ${line}`, err)
          }
        })
        .then(Promise.resolve())
      ])
      .then(() => {
        if (thisLine % 25000 === 0) { console.log(`Finished ${thisLine} items!  So far ${numUniqueLines} duplicates and ${numProductZeroReferences} references to ProductID 0.`); }
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
  return insertRelated(knex, url, false)
    .then(() => {
      console.log('Destroying connection pools');
      knex.destroy();
    })
  // return knex('related_products').del()
  //   .then(() => {return insertRelated(knex, url, true)})
  //   .then(() => {
  //     console.log('Destroying connection pools');
  //     knex.destroy();
  //   })
};
