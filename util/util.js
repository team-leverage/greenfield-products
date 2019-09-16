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