var createGraph = require('ngraph.graph');
var forEachChannel = require('./forEachChannel.js');

// setting to true will enforce data validation at expense of memory consumption
var CHECK_DUPE = false;

// set to true if you don't want to see auto generated channels in your graph
var EXCLUDE_AUTOCHANNELS = true;

// Set to true if you don't want to see channels recommended by YouTube in the graph
// Youtube recommends channels for a channel if customer didn't specify any.
// I found those recommendations very biased towards some channels, and by default
// don't want to see them in the graph
var EXCLUDE_YOUTUBE_SUGGESTIONS = true;

module.exports = loadGraph;

function loadGraph(fileName, done) {
  var graph = createGraph({uniqueLinkId: false});
  var ids = new Set();

  forEachChannel(fileName, addChannel, allDone);

  function addChannel(pkg) {
    if (CHECK_DUPE) {
      if (ids.has(pkg.id)) {
        console.log('Dupe: ' + pkg.id);
      }
      ids.add(pkg.id);
    }

    // Auto generated channels always started with #
    if (EXCLUDE_AUTOCHANNELS && pkg.title && pkg.title[0] === '#') return;

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
