const lineByLine = require('line-by-line');
const url = `./data/Skus/babyskus.csv`;

var isCheckUniqueError = function (err) {
  return err.message.includes('duplicate');
}

var insertSkus = function(knex, url, availableSizes, hasHeader = true) {
  let isFirstLine = true, thisReadLine = 0, thisEndLine, thisQueryLine = 1, numDuplicateLines = 0, numMultipooling = 0;

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
      let [id, style_id, size_name, quantity] = JSON.parse(`[${line}]`);

      let findSizeIdFirst = new Promise((res) => {
        // insert into sizes table if not already in availableSizes
        if (availableSizes[size_name] === undefined) {
          knex('sizes').insert({size_name}, 'size_id')
          .then((size_id) => {
            availableSizes[size_name] = Number(size_id);
          })
          .catch((err) => {
            if (isCheckUniqueError(err)) { // duplicate sizes error, probably from multipooling
              numMultipooling++;
            }
          })
          .finally(() => res(availableSizes[size_name]))
        } else {
          res(availableSizes[size_name]);
        }
      });

      return Promise.all([
        findSizeIdFirst
        .then((size_id) => {
          return knex('skus').insert({ // insert into skus
            sku_id: id,
            style_id,
            size_id,
            quantity
          })
        })
        .catch((err) => {
          if (isCheckUniqueError(err)) { // violates unique styleId/size constraint
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
  // return insertSkus(knex, url, {}, true);
  return knex('skus').del()
    .then(() => {
      return knex('sizes').del();
    })
    .then(() => {return insertSkus(knex, url, {}, true)})
};
