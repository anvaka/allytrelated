var fs = require('fs');
var path = require('path');
var createGraph = require('ngraph.graph');

var JSONStream = require('JSONStream');
var es = require('event-stream');
var loadBinaryGraph = require('./loadBinaryGraph.js');

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
      getNeigbourClusterIds: getNeigbourClusterIds,
      getSize: getSize,
      getClusterById: getClusterById,
      getClusterByChannelId: getClusterByChannelId,
      findNodeByData: findNodeByData,
      getClusterGraph: getClusterGraph,
      getSrcSubgraph: getSrcSubgraph
    };
  }

  function getSrcSubgraph(channelId, depth) {
    var depth = depth || 2;
    var srcNodeId = findNodeByData(channelId);
    var graph = createGraph({uniqueLinkId: false});
    var queue = [{
      srcNodeId: srcNodeId,
      depth: depth
    }];

    addNode(queue); // go

    return graph;

    function addNode(queue) {
      if (queue.length === 0) return;
      var request = queue.pop();
      var srcNodeId = request.srcNodeId;
      console.log('processing ' + srcNodeId);
      var depth = request.depth;
      // first, we need to add all direct neighbours:
      srcGraph.forEachLinkedNode(srcNodeId, addDirectNeigbours);
      // then we can build links between direct neigbours:
      srcGraph.forEachLinkedNode(srcNodeId, buildLinks);

      addNode(queue); // call recursively until we are done.

      function addDirectNeigbours(other, link) {
        var neigbourId = other.data;
        if (graph.getNode(neigbourId)) return; // already added

        if (depth > 0) {
          // schedule processing of the next level.
          queue.push({
            srcNodeId: other.id,
            depth: depth - 1
          });
          graph.addNode(neigbourId);
        }
      }

      function buildLinks(other, link) {
        var fromId = srcGraph.getNode(link.fromId).data;
        var toId = srcGraph.getNode(link.toId).data;

        if (!graph.hasLink(fromId, toId)) {
          graph.addLink(fromId, toId);
        }
      }
    }
  }

  function getClusterGraph(cluster) {
    var graph = createGraph({uniqueLinkId: false});

    cluster.nodes.forEach(addNodes);
    cluster.nodes.forEach(addLinks);

    return graph;

    function addNodes(node) {
      var id = srcGraph.getNode(node).data;
      graph.addNode(id);
    }

    function addLinks(node) {
      srcGraph.forEachLinkedNode(node, addLink);
    }

    function addLink(node, link) {
      var fromId = srcGraph.getNode(link.fromId).data;
      var toId = srcGraph.getNode(link.toId).data;

      if (graph.getNode(fromId) && graph.getNode(toId) && !graph.hasLink(fromId, toId)) {
        graph.addLink(fromId, toId);
      }
    }
  }

  function getClusterByChannelId(data) {
    var nodeId = findNodeByData(data);
    if (nodeId === undefined) return;

    var clusterId = getClusterIdByNodeId(nodeId);
    return getClusterById(clusterId);
  }

  function findNodeByData(data) {
    ensureSrcGraphLoaded();
    var nodeId;
    srcGraph.forEachNode(function(node) {
      if (node.data === data) {
        nodeId = node.id;
        return true;
      }
    });
    return nodeId;
  }

  function getClusterById(clusterId, maxVideo) {
    if (maxVideo === undefined) {
      maxVideo = Number.POSITIVE_INFINITY;
    }

    ensureSrcGraphLoaded();
    var size = getSize(clusterId);
    return {
      id: clusterId,
      size: size,
      nodes: clusters[clusterId].slice(0, Math.min(maxVideo, size))
    };
  }

  function toLink(nodeId) {
    return 'https://www.youtube.com/channel/' + srcGraph.getNode(nodeId).data;
  }

  function getSize(clusterId) {
    return clusters[clusterId].length;
  }

  function getNeigbourClusterIds(nodeId) {
    ensureSrcGraphLoaded();

    var neighbourClusters = new Set();
    var srcCluster = getClusterIdByNodeId(nodeId);
    srcGraph.forEachLinkedNode(nodeId, visit);

    return neighbourClusters;

    function visit(other, link) {
      if (link.toId === other.id) {
        var dstCluster = getClusterIdByNodeId(link.toId);
        if (dstCluster !== srcCluster) {
          var from = srcGraph.getNode(link.fromId).data;
          var to = srcGraph.getNode(link.toId).data;
          neighbourClusters.add(dstCluster);
        }
      }
    }
  }

  function ensureSrcGraphLoaded() {
    if (!srcGraph) {
      console.log('Loading original graph from ' + dirName + '. This will take a while...');
      srcGraph = loadBinaryGraph(dirName, true);
    }
  }

  function getClusterIdByNodeId(nodeId) {
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
