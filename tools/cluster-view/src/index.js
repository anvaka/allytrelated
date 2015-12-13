require('es6-promise').polyfill();
require('isomorphic-fetch');
 var query = require('query-string').parse(window.location.search.substring(1));

var channelId = query.id || 'UCy1Ms_5qBTawC-k7PVjHXKQ';
var fromjson = require('ngraph.fromjson');

fetch('http://0.0.0.0:3001/?id=' + channelId)
  .then(function(response) {
    if (response.status >= 400) {
      throw new Error("Bad response from server");
    }
    return response.json();
  })
  .then(function(jsonGraph) {
    console.log(jsonGraph);
    var graph = fromjson(jsonGraph);
    var renderGraph = require('ngraph.pixel');
    var renderer = renderGraph(graph);
    renderer.on('nodeclick', function (node) {
      window.open('https://www.youtube.com/channel/' + node.id, '_blank');
    });
    renderer.nodeSize(getNodeSize);
    renderer.linkColor(getLinkColor);
    var stopLayoutDelay = graph.getNodesCount() * 100;
    setTimeout(function() { renderer.stable(true); }, stopLayoutDelay);
  });

function getNodeSize(node) {
  return 10;
}

function getLinkColor(link) {
  return {
    from: 0xFFFFFF,
    to: 0x444444
  }
}
