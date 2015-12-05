var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var createGraph = require('ngraph.graph');

// setting to true will enforce data validation at expense of memory consumption
var CHECK_DUPE = false;

// set to true if you don't want to see auto generated channels in your graph
var EXCLUDE_AUTOCHANNELS = false;

// Set to true if you want to see channels recommended by YouTube in the graph
// Youtube recommends channels for a channel if customer didn't specify any.
// I found those recommendations very biased towards some channels, and by default
// don't want to see them in the graph
var EXCLUDE_YOUTUBE_SUGGESTIONS = true;

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
    if (CHECK_DUPE) {
      if (ids.has(pkg.id)) {
        console.log('Dupe: ' + pkg.id);
      }
      ids.add(pkg.id);
    }

    if (!pkg.title) return;
    // Auto generated channels always started with #
    if (EXCLUDE_AUTOCHANNELS && pkg.title[0] === '#') return;

    graph.addNode(pkg.id);
    var related = pkg.related;
    if (!related || related.length === 0) return;

    // Popular and Related channels are suggested by YouTube when user didn't include any.
    // We will ignore them
    if (EXCLUDE_YOUTUBE_SUGGESTIONS &&
        pkg.relatedTitle === 'Popular channels' ||
        pkg.relatedTitle === 'Related channels') return;

    for (var i = 0; i < related.length; ++i) {
      graph.addLink(pkg.id, related[i]);
    }
  }

  function allDone() {
    done(graph);
  }
}
