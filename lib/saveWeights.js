var path = require('path');
var fs = require('fs');

module.exports = saveWeights;

function saveWeights(graph, clusters, outDir) {
  var fileName = path.join(outDir, 'weights.bin');

  var idx = 0;
  var weightsBuffer = new Buffer(graph.getNodesCount() * 4);
  graph.forEachNode(writeWeigth);
  fs.writeFileSync(fileName, weightsBuffer);

  function writeWeigth(node) {
    var weight = clusters.getSize(node.id);
    weightsBuffer.writeInt32LE(weight, idx);
    idx += 4;
  }
}
