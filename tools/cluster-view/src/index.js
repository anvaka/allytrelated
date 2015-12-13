require('es6-promise').polyfill();
require('isomorphic-fetch');
var fromjson = require('ngraph.fromjson');

fetch('http://0.0.0.0:3001/?channelId=UCK3eoeo-HGHH11Pevo1MzfQ')
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
  });
