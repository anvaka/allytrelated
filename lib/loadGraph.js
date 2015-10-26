var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var createGraph = require('ngraph.graph');

module.exports = loadGraph;

function loadGraph(fileName, done) {
  if (!fs.existsSync(fileName)) {
    console.error('No data file: ' + fileName);
    console.error('Make sure to index youtube first with `node index.js` command');
    process.exit(-1);
  }
  var graph = createGraph({uniqueLinkId: false});
  var parser = JSONStream.parse();
  fs.createReadStream(fileName)
    .pipe(parser)
    .pipe(es.mapSync(addChannel))
    .on('end', allDone);

  function addChannel(pkg) {
    graph.addNode(pkg.id);
    var related = pkg.related;
    if (!related || related.length === 0) return;
    for (var i = 0; i < related.length; ++i) {
      graph.addLink(pkg.id, related[i]);
    }
  }

  function allDone() {
    done(graph);
  }
}
