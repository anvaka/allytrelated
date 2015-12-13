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
    window.g = graph; // for console debugging
    var renderGraph = require('ngraph.pixel');
    printStats(graph);
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

function printStats(graph) {
  var stats = getStats(graph)
  console.log(JSON.stringify(stats, null, 2));
}

function getStats(graph) {
  var centrality = require('ngraph.centrality');

  var degree = centrality.degree(graph)
  var inDegree = centrality.degree(graph, 'in');
  var outDegree = centrality.degree(graph, 'out');
  return {
    nodeCount: graph.getNodesCount(),
    linksCount : graph.getLinksCount(),
    degree: getTop(degree),
    inDegree: getTop(inDegree),
    outDegree: getTop(outDegree)
  }

  function getTop(hash) {
    return Object.keys(hash).sort(byValue).slice(0, 2).map(toNode);

    function byValue(x, y) {
      return hash[y] - hash[x];
    }
    function toNode(id) {
      var node = graph.getNode(id);
      return {
        url: 'https://www.youtube.com/channel/' + id,
        value: hash[id]
      }
    }
  }

}
