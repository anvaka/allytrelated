var toProtobuf = require('ngraph.toprotobuf');
var path = require('path');
var outDir = path.join(__dirname, '..', 'data', 'protograph');
var loadGraph = require('../lib/loadGraph.js');
loadGraph('./youtube-worker-jul31.json', onGotGraph);

function onGotGraph(graph) {
  console.log('saving to protobuf');
  toProtobuf(graph, { outDir: outDir  })
  console.log('done');
}
