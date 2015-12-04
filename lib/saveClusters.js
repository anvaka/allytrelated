var JSONStream = require('JSONStream');
var fs = require('fs');
module.exports = saveClusters;

function saveClusters(clusterIdToNode, outFileName) {
  var outgoing = JSONStream.stringify(false);
  var fileStream = fs.createWriteStream(outFileName, {
    encoding: 'utf8',
    flags: 'a'
  });
  outgoing.pipe(fileStream);

  clusterIdToNode.forEach(saveCluster);

  function saveCluster(nodes, cluster) {
    outgoing.write(nodes);
  }
}
