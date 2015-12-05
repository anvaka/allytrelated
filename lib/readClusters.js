var fs = require('fs');
var path = require('path');

var JSONStream = require('JSONStream');
var es = require('event-stream');
var loadGraph = require('./loadBinaryGraph.js');

module.exports = readClsuters;

function readClsuters(dirName, done) {
  var clustersFileName = path.join(dirName, 'allClusters.json');
  if (!fs.existsSync(clustersFileName)) {
    throw new Error('Clusters file ' + clustersFileName + ' is not found. Did you run findClusters.js?');
  }

  var nodeToCluster = new Map();
  var parser = JSONStream.parse();
  var clusters = [];
  var srcGraph;
  console.log('reading clusters definition');

  fs.createReadStream(clustersFileName)
    .pipe(parser)
    .pipe(es.mapSync(addCluster))
    .on('end', allDone);

  function addCluster(nodes) {
    var clusterId = clusters.length;
    clusters.push(nodes);
    rememberNodeCluster(nodes, clusterId);
    if (clusterId % 50000 === 0) {
      console.log('Read ' + clusterId + ' clusters');
    }
  }

  function allDone() {
    console.log(clusters.length + ' clusters loaded in memory');
    done(api());
  }

  function rememberNodeCluster(nodes, clusterId) {
    nodes.forEach(function(node) {
      nodeToCluster.set(node, clusterId);
    });
  }

  function api() {
    return {
      forEachCluster: forEachCluster,
      getNeigbourClusters: getNeigbourClusters
    };
  }

  function getNeigbourClusters(node) {
    if (!srcGraph) {
      console.log('Loading original graph in memory. This will take a while...');
      srcGraph = loadGraph(dirName);
    }

    var neighbourClusters = new Set();
    srcGraph.forEachLinkedNode(node, visit);

    return neighbourClusters;

    function visit(other, link) {
      if (link.toId === other.id) {
        neighbourClusters.add(nodeToCluster[link.toId]);
      }
    }
  }

  function forEachCluster(cb) {
    clusters.forEach(cb);
  }
}
