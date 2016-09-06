module.exports = readClusters;

var path = require('path');
var fs = require('fs');
var ProtoBuf = require('protobufjs');

function readClusters(clustersPath) {
  var clustersFile = path.join(clustersPath, 'clusters.pb');
  var protoFileName = clustersFile + '.proto';
  var builder = ProtoBuf.loadProtoFile(protoFileName);

  var Clusters = builder.build('Clusters');
  var clustersBuffer = readBuffer(clustersFile)

  var records = Clusters.decode(clustersBuffer).records;

  var nodeClassLookup = new Map();

  records.forEach(function(r) {
    nodeClassLookup.set(r.nodeId, r.clusterId);
  })

  return {
    getClass: getClass
  };

  function getClass(nodeId) {
    var classId = nodeClassLookup.get(nodeId);
    if (classId === undefined) throw new Error('Node is not defined: ' + nodeId);

    return classId;
  }
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
