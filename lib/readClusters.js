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
      getNeigbourClusters: getNeigbourClusters,
      getSize: getSize,
      info: info
    };
  }

  function info(clusterId) {
    var size = getSize(clusterId);
    return JSON.stringify({
      id: clusterId,
      size: size,
      nodes: clusters[clusterId].slice(0, Math.min(5, size)).map(toLink)
    }, null, 2);
  }

  function toLink(nodeId) {
    return 'https://www.youtube.com/channel/' + srcGraph.getNode(nodeId).data;
  }

  function getSize(clusterId) {
    return clusters[clusterId].length;
  }

  function getNeigbourClusters(node) {
    if (!srcGraph) {
      console.log('Loading original graph in memory. This will take a while...');
      srcGraph = loadGraph(dirName, true);
    }

    var neighbourClusters = new Set();
    var srcCluster = getNodeCluster(node);
    srcGraph.forEachLinkedNode(node, visit);

    return neighbourClusters;

    function visit(other, link) {
      if (link.toId === other.id) {
        var dstCluster = getNodeCluster(link.toId);
        if (dstCluster !== srcCluster) {
          var from = srcGraph.getNode(link.fromId).data;
          var to = srcGraph.getNode(link.toId).data;
          neighbourClusters.add(dstCluster);
        }
      }
    }
  }

  function getNodeCluster(nodeId) {
    var cluster = nodeToCluster.get(nodeId);
    if (cluster === undefined) {
      throw new Error('Node ' + nodeId + ' does not have assigned cluster');
    }
    return cluster;
  }

  function forEachCluster(cb) {
    clusters.forEach(cb);
  }
}
