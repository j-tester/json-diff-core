const diffURLS = require('./lib/diffURLs.js');
const diffJSON = require('./lib/diffJSON.js');
const writeCSV = require('./lib/writeCSV.js');

module.exports = {
  diffURLs(leftURL, rightURL, options) {
    return diffURLS(leftURL, rightURL, options);
  },

  diffJSON(leftJSON, rightJSON, options) {
    return diffJSON(leftJSON, rightJSON, options);
  },

  writeCSV(outputPath, table) {
    return writeCSV(outputPath, table);
  },
};
