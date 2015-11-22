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
  var ids = new Set();
  fs.createReadStream(fileName)
    .pipe(parser)
    .pipe(es.mapSync(addChannel))
    .on('end', allDone);

  function addChannel(pkg) {
    if (ids.has(pkg.id)) {
      console.log('Dupe: ' + pkg.id);
    }
    ids.add(pkg.id);
    if (!pkg.title) return;
    // Channels with # as a first letter are auto-generated channels. Ignore them
    if (pkg.title[0] === '#') return;

    graph.addNode(pkg.id);
    var related = pkg.related;
    if (!related || related.length === 0) return;
    // Popular and Related channels are suggested by YouTube when user didn't include any.
    // We will ignore them
    if (pkg.relatedTitle === 'Popular channels' ||
       pkg.relatedTitle === 'Related channels') {
      return;
    }
    for (var i = 0; i < related.length; ++i) {
      graph.addLink(pkg.id, related[i]);
    }
  }

  function allDone() {
    done(graph);
  }
}
