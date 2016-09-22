/**
 * This code will produce a clustering file
 */
var coarsen = require('ngraph.coarsen');
var path = require('path');
var detectClusters = require('ngraph.louvain/native.js').fromNgraph;
var toProtobuf = require('ngraph.toprotobuf');
var ProtoBuf = require('protobufjs');
var fs = require('fs');
var mkdirp = require('mkdirp');

module.exports = saveClusters;

var builder = ProtoBuf.protoFromString(getClustersProtoString());

var Clusters = builder.build('Clusters');
var NodeCluster = builder.build('NodeCluster');

function saveClusters(graph, outDir) {
  if (!fs.existsSync(outDir)) {
    mkdirp.sync(outDir);
  }

  var currentLayer = 0;
  var clusters;

  do {
    clusters = detectClusters(graph);
    var groupIsolates = true;
    clusters.renumber(groupIsolates);

    console.log('Clusters found. Saving layer ' + currentLayer);
    saveToDist(graph, clusters, currentLayer);

    console.log('Coarsening the graph');
    graph = coarsen(graph, clusters);
    console.log('Graph coarsed. Number of nodes: ' + graph.getNodesCount() + '; edges: ' + graph.getLinksCount());
    currentLayer += 1;
  } while (clusters.canCoarse());

  console.log('All done');

  function saveToDist(graph, clusters, layer) {
    var layerStr = layer.toString(10);
    var dir = path.join(outDir, layerStr)
    toProtobuf(graph, { outDir: dir })

    var records = [];
    var seen = [];
    graph.forEachNode(function(node) {
      var clusterId = clusters.getClass(node.id);
      seen[clusterId] = 1;
      var record = new NodeCluster();
      record.clusterId = number(clusterId);
      record.nodeId = node.id.toString();
      records.push(record);
    });

    for(var i = 0; i < seen.length; ++i) {
      if (seen[i] === undefined) {
        dumpGraph(graph);
        throw new Error('Found graph with blank claster')
      }
    }

    var clusters = new Clusters();
    clusters.records = records;
    console.log('records: ' + records.length);
    saveProtoObject(clusters, path.join(dir, 'clusters.pb'));
  }
}

function dumpGraph(graph) {
  var todot = require('ngraph.todot');
  console.log(todot(graph));
}

function saveProtoObject(object, fileName) {
  var arrayBuffer = object.toArrayBuffer();
  // Turns out node 5.1 crashes when array buffer has length 0.
  var nodeBuffer = (arrayBuffer.byteLength > 0) ? new Buffer(arrayBuffer) : new Buffer(0);
  fs.writeFileSync(fileName, nodeBuffer);
  fs.writeFileSync(fileName + '.proto', getClustersProtoString(), 'utf8');
}

function number(x) {
  var result = Number.parseInt(x, 10);
  if (Number.isNaN(result)) throw new Error('not a number ' + x)
  return result;
}

function getClustersProtoString() {
  return [
    'syntax = "proto3";',
    '',
    'message NodeCluster {',
    '  string nodeId = 1;',
    '  int32 clusterId = 2;',
    '}',
    '',
    'message Clusters {',
    '  repeated NodeCluster records = 1;',
    '}',
  ].join('\n');
}
