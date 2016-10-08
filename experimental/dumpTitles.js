var loadGraph = require('../lib/loadGraph.js');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var fileName = './youtube-worker-jul31.json';
var fs = require('fs');
var allLabels;

loadLabels(fileName, function(labels) {
  allLabels = labels;
  loadGraph(fileName, onGotGraph);
})

function onGotGraph(graph) {
  graph.forEachNode(function(node) {
    console.log(getTitle(node.id));
  })
}

function getTitle(nodeId) {
  return allLabels[nodeId];
}

function loadLabels(fileName, done) {
  var idToTitle = Object.create(null);

  console.log('Loading labels');
  var jsonStreamParser = JSONStream.parse();

  fs.createReadStream(fileName)
    .pipe(jsonStreamParser)
    .pipe(es.mapSync(cacheTitle))
    .on('end', function() {
      done(idToTitle);
    });

  function cacheTitle(obj) {
    idToTitle[obj.id] = obj.title;
  }
}
