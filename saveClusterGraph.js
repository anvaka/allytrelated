var globalGraph = require('ngraph.graph')({uniqueLinkId: false});
require('./lib/readClusters')('data', start);
var save = require('ngraph.tobinary');
var outDir = './data/global';
// could run parallel:
// forEachCluster(subGraph) {
//   layoutGraph(subGraph);
// }

function start(clusters) {
  clusters.forEachCluster(function (_, clusterId) {
    globalGraph.addNode(clusterId);
  });

  clusters.forEachCluster(function (nodes, clusterId) {
    var relatedClusters = getRelatedClusters(nodes, clusterId);
    relatedClusters.forEach(function (strength, relatedClusterId) {
      // TODO: can check if strength is above threshold
      globalGraph.addLink(clusterId, relatedClusterId);
    });
  });

  console.log('Saving global graph into ' + outDir);
  save(globalGraph, { outDir: outDir });
  console.log('Done.');
  return;

  function getRelatedClusters(nodes, srcClusterId) {
    var strength = new Map();
    nodes.forEach(assignNodeStrengthConnection);

    return strength;

    function assignNodeStrengthConnection(node) {
      var nodeCluster = clusters.getNeigbourClusters(node);
      assignClusterStrengthConnection(nodeCluster);
    }

    function assignClusterStrengthConnection(dstCluster) {
      if (dstCluster !== srcClusterId) {
        var currentStrength = (strength.get(dstCluster) || 0) + 1;
        strength.set(dstCluster, currentStrength);
      }
    }
  }
}
