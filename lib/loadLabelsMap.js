var fs = require('fs');
var path = require('path');

module.exports = loadLabels;

function loadLabels(dirName) {
  var fileName = path.join(dirName, 'labels.json');
  if (!fs.existsSync(fileName)) {
    throw new Error('Labels graph file ' + fileName + ' does not exist. Did you run toBinaryGraph.js?');
  }

  var content = fs.readFileSync(fileName, 'utf8');
  var labels = JSON.parse(content);

  var labelToIndex = new Map();
  labels.forEach(function(label, index) { labelToIndex.set(label, index); });
  return labelToIndex;
}
