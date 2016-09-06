/**
 * Converts saved clusters into subgraphs.
 */
console.log('Loading 0 level graph...');

var currentLayerNumber = 0;

var fs = require('fs');
var path = require('path');
var outDir = path.join(__dirname, '..', 'data', 'subgraphs');
var clustersDir = path.join(__dirname,'..', 'data', 'clusters');

var allGraphsIndexFileName = path.join(outDir, 'allSubgraphs.json');
var allSavedGraphs = [];

var readClusters = require('./lib/readClusters.js');
var coarsen = require('ngraph.coarsen');
var toProtobuf = require('ngraph.toprotobuf');
var fromProtobuf = require('ngraph.toprotobuf/readPrimitive.js');

var currentLayerDef = readLayerDef(currentLayerNumber);
var currentLayerPath;
var ratio;

do {
  currentLayerPath = path.join(outDir, currentLayerNumber.toString(10));
  saveSubgraphs(currentLayerDef);

  currentLayerNumber += 1;

  var nextLayerDef = readLayerDef(currentLayerNumber)
  var nextLayerSize = getNodeCount(nextLayerDef);
  var currentLayerSize = getNodeCount(currentLayerDef)

  ratio = nextLayerSize/currentLayerSize;
  currentLayerDef = nextLayerDef;
} while (ratio > 0.01 && currentLayerDef);

console.log('Saving index of all saved graphs into ', allGraphsIndexFileName);
fs.writeFileSync(allGraphsIndexFileName, JSON.stringify(allSavedGraphs), 'utf8');
console.log('Done');

function readLayerDef(layerIndex) {
  var layerPath = path.join(clustersDir, layerIndex.toString(10));
  var layerGraphDefPath = path.join(layerPath, 'graph-def.json');

  console.log('Trying to read graph def at ' + layerGraphDefPath);
  if (!fs.existsSync(layerGraphDefPath)) {
    console.log('Graph def not found. Either we are done, or clusters were not saved');
    return;
  }

  var graphInfo = fromProtobuf(layerGraphDefPath);
  console.log('GraphDef loaded: ' + JSON.stringify(graphInfo.def, null, 2));

  graphInfo.clusters = readClustersInfo(layerPath)

  return graphInfo;
}

function readClustersInfo(layerPath) {
  console.log('Loading clusters from ' + layerPath);

  return readClusters(layerPath);
}

function getNodeCount(layerDef) {
  if (!layerDef) return 0;

  return layerDef.def.stats.nodes;
}

function saveSubgraphs(layerDef) {
  var srcGraph = toNgraph(layerDef.graph);
  console.log('Building coarse graphs at level ' + currentLayerNumber);

  var communityGraph = coarsen(srcGraph, layerDef.clusters);
  var communityNodeGraphNodeCount = communityGraph.getNodesCount();
  var currentNodeIndex = 0;

  // In community graph each node is a community (aka cluster) inside lower
  // level graph.
  communityGraph.forEachNode(saveInternalNode);

  function saveInternalNode(communityNode) {
    currentNodeIndex += 1;
    var nodeSet = communityNode.data;

    var graph = makeInternalGraph(nodeSet, srcGraph);
    var graphFolder = path.join(currentLayerPath, communityNode.id.toString(10));

    console.log(currentNodeIndex + '/' + communityNodeGraphNodeCount + ': Saving ' + graphFolder);
    toProtobuf(graph, {
      outDir: graphFolder,
      saveLinksData: true
    })

    allSavedGraphs.push(graphFolder);
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
    var from = nodes[link.source].id;
    var to = nodes[link.target].id;

    if (link.data) graph.addLink(from, to, link.data);
    else graph.addLink(from, to);
  });

  return graph;
}
