module.exports = getNodesInCluster;

var path = require('path');
var fs = require('fs');
var ProtoBuf = require('protobufjs');

function getNodesInCluster(clustersPath) {
  var clustersFile = path.join(clustersPath, 'clusters.pb');
  var protoFileName = clustersFile + '.proto';
  var builder = ProtoBuf.loadProtoFile(protoFileName);

  var Clusters = builder.build('Clusters');
  var clustersBuffer = readBuffer(clustersFile)

  var records = Clusters.decode(clustersBuffer).records;

  var nodesInCluster = new Map();

  records.forEach(function(r) {
    var nodes = nodesInCluster.get(r.clusterId);
    if (!nodes) {
      nodes = new Set();
      nodesInCluster.set(r.clusterId, nodes);
    }
    nodes.add(r.nodeId);
  });

  return nodesInCluster;
}

function readBuffer(name) {
  var buffer = fs.readFileSync(name);
  return toArrayBuffer(buffer);
}

function toArrayBuffer(nodeBuffer) {
    var arrayBuffer = new ArrayBuffer(nodeBuffer.length);

    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < nodeBuffer.length; ++i) {
        view[i] = nodeBuffer[i];
    }
    return arrayBuffer;
}
