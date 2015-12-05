/**
 * Prerequiesites:
 * node --max-old-space-size=10000 toBinaryGraph.js
 */
var createWhisper = require('ngraph.cw');
var save = require('./lib/saveClusters.js');
var outFileName = './data/allClusters.json';

console.log('This program will detect clusters in the graph and save them into ' + outFileName);
console.log('Loading graph...');
var graph = require('./lib/loadBinaryGraph.js')('./data');
detectClusters(graph);

function detectClusters(graph) {
  console.log('Graph loaded: ' + graph.getLinksCount() + ' edges, ' + graph.getNodesCount() + ' nodes');
  console.log('Computing clusters...');

  var whisper = createWhisper(graph, 'out');
  var iterationNumber = 0;

  while (whisper.getChangeRate() > 0) {
    iterationNumber += 1;
    whisper.step();
    console.log('Iteration ' + iterationNumber + '; Change rate: ' + whisper.getChangeRate());
  }

  var clusterIdToNodes = whisper.createClusterMap();
  save(clusterIdToNodes, outFileName);
  console.log('Done!');
}
