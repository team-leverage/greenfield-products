const {LoremName, LoremSlogan, LoremDescription} = require('./lorem');

exports.isCheckUniqueError = function (err) {
  return err.message.includes('duplicate');
}

exports.isCheckPoolError = function (err) {
  return (err.message.includes('pool') || err.message.includes('too many clients'));
}

exports.isFirstPartFile = function (fileName) {
  return fileName.slice(fileName.length - 6) === 'part00';
}

exports.generateFileList = function(prefix, numFiles) {
  let listOfFiles = [];
  for (let i = 0; i < numFiles; i++) {
      listOfFiles.push(prefix+String(i).padStart(2, '0'));
  }
  return listOfFiles;
}

// const makeFakeProduct = function() { // QUESTION: Do I want to generate SINGLE fake product or a BUNCH of fake products?

// }

// const makeFakeStyle = function() {

// }

// // const makeFakeFeature
// // const makeFakeRelated

// exports.insertFakeData = function(knex, table, targetCount) { // table could be products, styles
//   var makeFunction;
//   let count = knex(table).count();
//   switch (table) {
//     case ('products'):
//       makeFunction = makeFakeProduct;
//     case ('styles'):
//       makeFunction = makeFakeStyle;
//   }
//   while (count < targetCount) {
    
//     count++ // ONLY if insertX returns true
//   }
// }
