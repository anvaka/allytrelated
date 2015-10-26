require('./lib/loadGraph.js')(process.argv[2] || './data/youtube.json', start);
var todot = require('ngraph.todot');

function start(graph) {
  var dot = todot(graph);
  console.log(dot);
}
