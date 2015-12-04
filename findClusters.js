var createWhisper = require('ngraph.cw');
var save = require('./lib/saveClusters.js');
var outFileName = 'allClusters.json';

console.log('This program will detect clusters in the graph and save them into ' + outFileName);
console.log('Loading graph...');
require('./lib/loadGraph.js')(process.argv[2] || './data/youtube-user.json', detectClusters);

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

  var clusterIdToNode = whisper.creeateClusterMap();
  save(clusterIdToNode, outFileName);
  console.log('Done!');
}
