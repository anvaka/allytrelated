var save = require('ngraph.tobinary');
require('./lib/loadGraph.js')(process.argv[2] || './data/youtube-user.json', start);


function start(graph) {
  console.log('loaded graph');
  console.log(graph.getLinksCount() + ' edges; ' + graph.getNodesCount() + ' nodes');
  var layout = require('ngraph.offline.layout')(graph);
  console.log('Starting layout. This will take a while...');
  layout.run();
  save(graph, { outDir: './data' });
  console.log('Done.');
  console.log('Copy `links.bin`, `labels.json` and positions.bin into dat folder');
}
