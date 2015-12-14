var globalGraph = require('ngraph.graph')({uniqueLinkId: false});
require('./lib/readClusters')('data', start);
var save = require('ngraph.tobinary');
var saveWeights = require('./lib/saveWeights.js');

var outDir = './data/global';

function start(clusters) {
  clusters.forEachCluster(function (_, clusterId) {
    globalGraph.addNode(clusterId);
  });

  clusters.forEachCluster(function (nodes, clusterId) {
    var relatedClusters = getRelatedClusters(nodes, clusterId);
    var srcSize = clusters.getSize(clusterId);
    relatedClusters.forEach(function (strength, relatedClusterId) {
      // Add connection between clusters only when there is a strong correlation between them:
      var dstSize = clusters.getSize(relatedClusterId);
      var similarity = strength/(dstSize + srcSize);
      if (similarity > 0.18) {
        globalGraph.addLink(clusterId, relatedClusterId);
      }
    });
  });

  saveClusterGraph();

  return;

  function saveClusterGraph() {
    console.log('Saving global graph into ' + outDir);
    save(globalGraph, { outDir: outDir });
    saveWeights(globalGraph, clusters, outDir);
    console.log('Done.');
  }

  function getRelatedClusters(nodes, srcClusterId) {
    var strength = new Map();
    nodes.forEach(assignNodeStrengthConnection);

    return strength;

    function assignNodeStrengthConnection(node) {
      var nodeCluster = clusters.getNeigbourClusters(node);
      nodeCluster.forEach(assignClusterStrengthConnection);
    }

    function assignClusterStrengthConnection(dstCluster) {
      var currentStrength = (strength.get(dstCluster) || 0) + 1;
      strength.set(dstCluster, currentStrength);
    }
  }
}

