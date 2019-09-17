/* eslint-disable camelcase, no-plusplus */
const lineByLine = require('line-by-line');

const path = './data/Skus';
const {
  isCheckUniqueError, isCheckPoolError, isFirstPartFile, generateFileList,
} = require('../../../util/util');

const insertSkus = function (knex, url, availableSizes, hasHeader = true) {
  let isFirstLine = true;
  let thisReadLine = 0;
  let thisEndLine;
  let thisQueryLine = 1;
  let numDuplicateLines = 0;
  let numMultipooling = 0;
  let numPoolErrors = 0;
  return new Promise(((resolveOuterPromise) => {
    const rl = new lineByLine(url);
    // beginning of rl.on('line') block
    rl.on('line', (line) => {
      thisReadLine++;
      if (isFirstLine && hasHeader) {
        console.log('Starting To Load CSV into Database');
        isFirstLine = false;
        thisQueryLine++;
        return;
      }
      const [id, style_id, size_name, quantity] = JSON.parse(`[${line}]`);

      const findSizeIdFirst = new Promise((res) => {
        // insert into sizes table if not already in availableSizes
        if (availableSizes[size_name] === undefined) {
          knex('sizes').insert({ size_name }, 'size_id')
            .then((size_id) => {
              availableSizes[size_name] = Number(size_id);
            })
            .catch((err) => {
              if (isCheckUniqueError(err)) { // duplicate sizes error, probably from multipooling
                numMultipooling++;
              }
            })
            .finally(() => res(availableSizes[size_name]));
        } else {
          res(availableSizes[size_name]);
        }
      });

      return Promise.all([
        findSizeIdFirst
          .then((size_id) => knex('skus').insert({ // insert into skus
            sku_id: id,
            style_id,
            size_id,
            quantity,
          }))
          .catch((err) => {
            if (isCheckUniqueError(err)) { // violates unique styleId/size constraint
              numDuplicateLines++;
            } else if (isCheckPoolError(err)) {
              numPoolErrors++;
            } else { // if the error is another error
              console.log(`PROBLEM LINE FOR STYLES ${thisQueryLine}: ${line}`, err);
            }
          }),
        // .then(Promise.resolve()) // PROBABLY NOT EVEN NECESSARY
      ])
        .then(() => {
          if (thisQueryLine % 25000 === 0) {
            console.log(`Finished ${thisQueryLine} items!  So far ${numDuplicateLines} duplicates, ${numPoolErrors} pool errors.`);
          }
          if (thisQueryLine === thisEndLine) {
            console.log('DONE with this file... onto next file...');
            resolveOuterPromise();
          }
          thisQueryLine++;
        })
        .catch(((err) => { console.log(err); }));
    });
    // end of rl.on('line') block
    rl.on('end', () => {
      thisEndLine = thisReadLine;
      console.log('Reading Finished, closing file...');
      rl.close();
    });
  }));
};

const batchInsertSeed = function (knex, fileList) {
  const availableSizes = {};
  switch (fileList.length) {
    case (0):
      console.log('DONE with ALL files! Destroying connection pools');
      return knex.destroy();
    case (1): // first file
      return insertSkus(knex, fileList[0], availableSizes, isFirstPartFile(fileList[0]));
    default:
      const lastFile = fileList.pop();
      console.log(lastFile);
      return insertSkus(knex, lastFile, availableSizes, isFirstPartFile(lastFile))
        .then(() => batchInsertSeed(knex, fileList));
  }
};

exports.seed = function (knex) {
  // return insertSkus(knex, url, {}, true);

  // return knex('skus').del()
  //   .then(() => {
  //     return knex('sizes').del();
  //   })
  //   .then(() => {return insertSkus(knex, url, {}, true)})

  // let listOfFiles = generateFileList(`${path}/skus.part`, 48);
  const listOfFiles = ['./data/Skus/smallerchunks/skus.part05'];
  return batchInsertSeed(knex, listOfFiles);
};
