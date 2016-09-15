/**
 * Converts saved clusters into subgraphs.
 */
console.log('Loading 0 level graph...');

var currentLayerNumber = 0;

// There are lots of clusters (tens of thousands) with 1-2 nodes in them. It would be inefficient
// to store each of them into individual file.
var nodesPerFileThreshold = 50000;

var fs = require('fs');
var path = require('path');
var outDir = path.join(__dirname, '..', 'data', 'subgraphs');
var clustersDir = path.join(__dirname,'..', 'data', 'clusters');
var getNodesInCluster = require('./lib/readClusters.js');

var toProtobuf = require('ngraph.toprotobuf');
var fromProtobuf = require('ngraph.toprotobuf/readPrimitive.js');

var srcGraph = readLayerGraph(currentLayerNumber);
var ratio;

do {
  var clusterGraph = readLayerGraph(currentLayerNumber + 1)
  if (!clusterGraph) break;

  saveSubgraphs(srcGraph, clusterGraph);

  var nextLayerSize = clusterGraph.graph.getNodesCount();
  var currentLayerSize = srcGraph.graph.getNodesCount();

  ratio = nextLayerSize/currentLayerSize;
  srcGraph = clusterGraph;

  currentLayerNumber += 1;
} while (ratio > 0.01);


function readLayerGraph(layerIndex) {
  var layerPath = path.join(clustersDir, layerIndex.toString(10));
  var layerGraphDefPath = path.join(layerPath, 'graph-def.json');
  if (!fs.existsSync(layerGraphDefPath)) {
    console.log('Graph def not found. Either we are done, or clusters were not saved');
    return;
  }

  var nodesInCluster = getNodesInCluster(layerPath);
  console.log('Trying to read graph def at ' + layerGraphDefPath);

  var graphInfo = fromProtobuf(layerGraphDefPath);
  console.log('GraphDef loaded: ' + JSON.stringify(graphInfo.def, null, 2));

  var graph = toNgraph(graphInfo.graphs[0]);
  return {
    graph: graph,
    nodesInCluster: nodesInCluster
  };
}

function saveSubgraphs(current, next) {
  console.log('Building coarse graphs at level ' + currentLayerNumber);
  var graphBuffer = createGraphBuffer(nodesPerFileThreshold, currentLayerNumber);

  // next level graph is a community graph (graph of clusters) for the current
  // level graph
  var clusterGraph = next.graph;
  var communityNodeGraphNodeCount = clusterGraph.getNodesCount();
  var currentNodeIndex = 0;

  // In community graph each node is a community (aka cluster) inside lower
  // level graph.
  clusterGraph.forEachNode(saveInternalNode);

  graphBuffer.commit();

  function saveInternalNode(cluster) {
    currentNodeIndex += 1;
    var clusterId = Number.parseInt(cluster.id, 10);
    if (Number.isNaN(clusterId)) throw new Error('Unexpected cluster id: ' + cluster.id);

    var nodeSet = current.nodesInCluster.get(clusterId);
    if (!nodeSet) throw new Error('Cluster is not defuned: ' + clusterId);

    var graph = makeInternalGraph(nodeSet, srcGraph.graph);
    graphBuffer.add(graph, clusterId);
    console.log(currentNodeIndex + '/' + communityNodeGraphNodeCount + ' added ');
  }
}

function createGraphBuffer(nodesPerFileThreshold, currentLayerNumber) {
  // accumulator for total number of nodes in the current buffer
  var totalNodes = 0;

  var currentLayerPath = path.join(outDir, currentLayerNumber.toString(10));

  // list of graphs that is accumulated to the total of `nodesPerFileThreshold`
  // Once the threshold is met, the graphs in this array are dumped to the disk
  var buffer = [];

  // chunks are just sequentially increased with each buffer dump and used to
  // name files.
  var chunk = 0;
  var chunks = [];
  var clusterInfo = {}

  var graphInfo = {
    clusterInfo: clusterInfo,
    chunks: chunks
  };

  return {
    add: add,
    commit: commit
  };

  function commit() {
    dump();

    var indexName = path.join(currentLayerPath, 'index.json')
    console.log('Saving index of all saved graphs on this layer ', indexName);
    fs.writeFileSync(indexName, JSON.stringify(graphInfo, null, 2), 'utf8');
    console.log('Done');
  }

  function add(graph, clusterId) {
    totalNodes += graph.getNodesCount();

    buffer.push({
      graph: graph,
      clusterId: clusterId
    });

    if (totalNodes > nodesPerFileThreshold) {
      dump();
    }
  }

  function dump() {
    var chunkFolder = path.join(currentLayerPath, chunk.toString(10));
    chunks.push(chunkFolder);

    var graphs = [];
    buffer.forEach(function(x, idx) {
      var graph = x.graph;
      clusterInfo[x.clusterId] = {
        nodes: graph.getNodesCount(),
        edges: graph.getLinksCount(),
        chunk: chunk,
        index: idx
      }

      graphs.push(graph);
    });

    toProtobuf(graphs, {
      outDir: chunkFolder
    })

    chunk += 1;
    totalNodes = 0;
    buffer = [];
  }
}

function makeInternalGraph(nodeSet, srcGraph) {
  var graph = require('ngraph.graph')({uniqueLinkIds: false});

  nodeSet.forEach(addNode);
  nodeSet.forEach(addInternalEdges);

  return graph;

  function addNode(srcNodeId) {
    graph.addNode(srcNodeId);
  }

  function addInternalEdges(srcNodeId) {
    srcGraph.forEachLinkedNode(srcNodeId, appendLinkIfInternal, true);

    function appendLinkIfInternal(otherNode, nlink) {
      if (!nodeSet.has(otherNode.id)) return; // this edge goes outside. Ignore it.

      graph.addLink(srcNodeId, otherNode.id, nlink.data);
    }
  }
}

function toNgraph(linksNodes) {
  var graph = require('ngraph.graph')({uniqueLinkIds: false});
  var nodes = linksNodes.nodes;

  nodes.forEach(function(node) {
    graph.addNode(node.id)
  });

  linksNodes.links.forEach(function(link) {
    var from = nodes[link.from].id;
    var to = nodes[link.to].id;

    if (link.data) graph.addLink(from, to, link.data);
    else graph.addLink(from, to);
  });

  return graph;
}
