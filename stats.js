require('./lib/loadGraph.js')(process.argv[2] || './data/youtube-user.json', start);
var centrality = require('ngraph.centrality');

function start(graph) {
  console.log(graph.getLinksCount() + ' edges; ' + graph.getNodesCount() + ' nodes');
  var inCentrality = centrality.degree(graph, 'in');
  Object.keys(inCentrality).sort(byValue).slice(0, 100).map(toUrl).forEach(print);

  function byValue(x, y) {
    return inCentrality[y] - inCentrality[x];
  }

  function toUrl(key) {
    return 'https://www.youtube.com/channel/' + key + ' - ' + inCentrality[key];
  }

  function print(x) {
    console.log(x);
  }
}
