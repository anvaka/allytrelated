var express = require('express');
var tojson = require('ngraph.tojson');
var path = require('path');
var cors = require('cors');

var clusterPath = path.join(__dirname, '..', '..', '..', 'data');
console.log('Reading clusters');
require('../../../lib/readClusters')(clusterPath, start);

function start(clusters) {
  const app = express()
  app.use(cors());
  app.get('/', function (req, res) {
    console.log('Handling query: ' + req.query);
    var channelId = req.query.id;
    console.log('Returning graph for: ' + channelId);

    var cluster = clusters.getClusterByChannelId(channelId);
    var info = [clusters.getClusterGraph(cluster)];
    // if we want related neighbours we'll add them here
    if (req.query.related) {
      console.log('Loading related clusters');
      var nodeId = clusters.findNodeByData(channelId);
      var neighbourIds = clusters.getNeigbourClusterIds(nodeId)
      neighbourIds.forEach(function(clusterId) {
        var cluster = clusters.getClusterById(clusterId);
        info.push(clusters.getClusterGraph(cluster));
      });
      console.log(neighbours);
    }
    res.send(JSON.stringify(info.map(graphToJson)));

    function addNeigbour(cluster) {
      cluster.nodes
    }
  });

  function graphToJson(graph) {
    return tojson(graph)
  }

  var server = app.listen(3001, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
}
