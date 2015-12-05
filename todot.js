require('./lib/loadGraph.js')(process.argv[2] || './youtube-user.json', start);
var todot = require('ngraph.todot');

function start(graph) {
  var dot = todot(graph);
  console.log(dot);
}
