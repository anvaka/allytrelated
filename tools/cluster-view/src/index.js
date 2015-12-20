require('es6-promise').polyfill();
require('isomorphic-fetch');
var createGraph = require('ngraph.graph');
var query = require('query-string').parse(window.location.search.substring(1));

var channelId = query.id || 'UCy1Ms_5qBTawC-k7PVjHXKQ';
var fromjson = require('ngraph.fromjson');

var handler = query.operation || 'cluster'; // channel
var url = 'http://0.0.0.0:3001/' + handler + '?id=' + channelId;
if (query.related) {
  url += '&related=1';
}
if (query.depth) {
  url += '&depth=' + query.depth;
}

fetch(url)
  .then(function(response) {
    if (response.status >= 400) {
      throw new Error("Bad response from server");
    }
    return response.json();
  })
  .then(function(jsonGraph) {
    console.log(jsonGraph);
    var graph = mergeGraphs(jsonGraph);
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

function mergeGraphs(graphs) {
  var graph = createGraph({uniqueLinkId: false});
  graphs.forEach(appendGraph);

  return graph;

  function appendGraph(json, idx) {
    var cluster = fromjson(json);
    cluster.forEachNode(appendNode);
    cluster.forEachLink(appendLink);

    function appendNode(node) {
      graph.addNode(node.id, idx);
    }

    function appendLink(link) {
      graph.addLink(link.fromId, link.toId);
    }
  }
}
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
