const lineByLine = require('line-by-line');
const url = `./data/Photos/photos.part25`;
const {isCheckUniqueError, isCheckPoolError} = require('../../../util/util');

var insertPhotos = function(knex, url, hasHeader = true) {
  let isFirstLine = true, thisReadLine = 0, thisEndLine, thisQueryLine = 1, numDuplicateLines = 0, numParseFailLines = 0, numPoolErrors = 0;
  return new Promise(function (resolveOuterPromise) {
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
      try{
        let [id, style_id, main_url, thumbnail_url] = JSON.parse(`[${line}]`);
        return Promise.all([
          // insert into photos table
          knex('photos').insert({
            photo_id: Number(id),
            style_id: Number(style_id),
            main_url,
            thumbnail_url
          })
          .catch((err) => {
            if (isCheckUniqueError(err)) { // if duplicate error, select from existing
              numDuplicateLines++;
            } else if (isCheckPoolError(err)){
              numPoolErrors++;
            } else {  // if the error is another error
              console.log(`PROBLEM LINE FOR PHOTOS ${thisQueryLine}: ${line}`, err)
            }
          })
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
        .catch(((err) => {console.log(err)}))
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
  })
}

exports.seed = function(knex) {
  return insertPhotos(knex, url, false)
  // return knex('photos').del()
  //   .then(() => {return insertPhotos(knex, url, true)})
};
