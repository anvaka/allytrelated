/**
 * Converts saved graph into clusters
 */
console.log('Parsing graph file...');

var saveClusters = require('./lib/saveClusters.js');

// var content = require('../data/large.json');
// var graph = require('ngraph.fromjson')(content);
// onGotGraph(graph);

var loadGraph = require('../lib/loadGraph.js');

loadGraph('./youtube-worker-jul31.json', onGotGraph);

function onGotGraph(graph) {
  saveClusters(graph, 'data/clusters');
}
