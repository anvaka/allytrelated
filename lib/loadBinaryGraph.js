/**
 * This file will load graph previously stored into binary format by 'toBinaryGraph.js'
 */
var fs = require('fs');
var path = require('path');
var createGraph = require('ngraph.graph');
var loadLabels = require('./loadLabelsMap.js');

module.exports = loadGraph;

function loadGraph(dirName, saveLabel) {
  var linksFileName = path.join(dirName, 'links.bin');
  if (!fs.existsSync(linksFileName)) {
    throw new Error('Binary graph file ' + linksFileName + ' does not exist. Did you run toBinaryGraph.js?');
  }

  var graph = createGraph({uniqueLinkId: false});

  console.log('Loading labels definition...');
  var labelsMap = loadLabels(dirName);
  console.log('Loaded ' + labelsMap.size + ' labels');

  console.log('Initializing graph nodes...');
  labelsMap.forEach(function (index, label) {
    if (saveLabel) {
      graph.addNode(index, label);
    } else {
      graph.addNode(index);
    }
  });
  console.log('Done. Reading links definition from ' + linksFileName);

  var linksBuffer = fs.readFileSync(linksFileName);
  var i = 0;
  var srcIndex;
  while (i < linksBuffer.length) {
    var linkId = linksBuffer.readInt32LE(i);
    if (linkId < 0) {
      srcIndex = -linkId - 1;
    } else {
      var toIndex  = linkId - 1;
      graph.addLink(srcIndex, toIndex);
    }
    i += 4;
  }

  console.log('Graph loaded in memory. ' + graph.getNodesCount() + ' nodes; ' +
              graph.getLinksCount() + ' edges');

  return graph;
}
