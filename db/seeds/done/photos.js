/* eslint-disable camelcase, no-plusplus, consistent-return */
const LineByLine = require('line-by-line');

const url = './data/Photos/photos.part25';
const { isCheckUniqueError, isCheckPoolError } = require('../../../util/util');

const insertPhotos = function (knex, seedFilePath, hasHeader = true) {
  let isFirstLine = true;
  let thisReadLine = 0;
  let thisEndLine;
  let thisQueryLine = 1;
  let numDuplicateLines = 0;
  let numParseFailLines = 0;
  let numPoolErrors = 0;
  return new Promise(((resolveOuterPromise) => {
    const rl = new LineByLine(seedFilePath);
    // beginning of rl.on('line') block
    rl.on('line', (line) => {
      thisReadLine++;
      if (isFirstLine && hasHeader) {
        console.log('Starting To Load CSV into Database');
        isFirstLine = false;
        thisQueryLine++;
        return;
      }
      try {
        const [id, style_id, main_url, thumbnail_url] = JSON.parse(`[${line}]`);
        return Promise.all([
          // insert into photos table
          knex('photos').insert({
            photo_id: Number(id),
            style_id: Number(style_id),
            main_url,
            thumbnail_url,
          })
            .catch((err) => {
              if (isCheckUniqueError(err)) { // if duplicate error, select from existing
                numDuplicateLines++;
              } else if (isCheckPoolError(err)) {
                numPoolErrors++;
              } else { // if the error is another error
                console.log(`PROBLEM LINE FOR PHOTOS ${thisQueryLine}: ${line}`, err);
              }
            }),
        ])
          .then(() => {
            if (thisQueryLine % 25000 === 0) {
              console.log(`Finished ${thisQueryLine} items!  So far ${numDuplicateLines} duplicates, ${numPoolErrors} pool errors, and ${numParseFailLines} bad JSON lines.`);
            }
            if (thisQueryLine === thisEndLine) {
              console.log('DONE! Destroying connection pools');
              knex.destroy();
              resolveOuterPromise();
            }
            thisQueryLine++;
          })
          .catch(((err) => { console.log(err); }));
      } catch (err) {
        thisQueryLine++;
        numParseFailLines++;
        console.log(err.message, `on line ${line.split(',')[0]}`);
      }
    });
    // end of rl.on('line') block
    rl.on('end', () => {
      thisEndLine = thisReadLine;
      console.log('Reading Finished, closing file...');
      rl.close();
    });
  }));
};

exports.seed = function (knex) {
  return insertPhotos(knex, url, false);
  // return knex('photos').del()
  //   .then(() => {return insertPhotos(knex, url, true)})
};
