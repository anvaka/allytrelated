var indices = require('./data/category10.json');
var channelId = require('./data/channelId.json');
var channelsInCluster = indices.map(idx => channelId[idx]);
var graph = require('ngraph.graph')({uniqueLinkId: false});
channelsInCluster.forEach(channel => graph.addNode(channel));

var path = require('path');
var save = require('ngraph.tobinary');
var outDir = path.join(__dirname, 'data', 'blondel');

var fileName = process.argv[2] || './youtube-user.json';

var forEachChannel = require('./lib/forEachChannel.js');


console.log('This program saves graph into binary file');
console.log('Loading graph from ' + fileName + '...');

var processed = 0;
forEachChannel(fileName, visit, done);

function visit(channel) {
  processed += 1;
  if (processed % 50000 === 0) console.log('Processed: ' + processed);
  var fromId = channel.id;
  if (!graph.getNode(fromId)) return;

  var related = channel.related;

  if (related) {
    for (var i = 0; i < related.length; ++i) {
      if (graph.getNode(related[i])) {
        graph.addLink(fromId, related[i]);
      }
    }
  }
}
function done() {
  console.log("Done");
  console.log(graph.getLinksCount() + ' edges; ' + graph.getNodesCount() + ' nodes');
  save(graph, { outDir: outDir});

  var layout = require('ngraph.offline.layout')(graph);
  console.log('Starting layout. This will take a while...');
  layout.run();
  console.log('Done.');
  console.log('Copy `links.bin`, `labels.json` and positions.bin into dat folder');
}
