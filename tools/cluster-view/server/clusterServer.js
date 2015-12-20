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
  app.get('/cluster', clusterHandler);
  app.get('/channel', channelHandler);

  function graphToJson(graph) {
    return tojson(graph)
  }

  var server = app.listen(3001, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });

  function clusterHandler(req, res) {
    console.log('Handling query: ' + JSON.stringify(req.query));
    var channelId = req.query.id;
    console.log('Returning cluster graph for: ' + channelId);

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
      console.log(neighbourIds);
    }

    res.send(JSON.stringify(info.map(graphToJson)));

    function addNeigbour(cluster) {
      cluster.nodes
    }
  }

  function channelHandler(req, res) {
    console.time('channel');
    console.log('Handling query: ' + JSON.stringify(req.query));
    var channelId = req.query.id;
    var depth = parseInt(req.query.depth, 10);
    if (isNaN(depth)) depth = 2;
    console.log('Returning channel graph for: ' + channelId);
    var info = [clusters.getSrcSubgraph(channelId, depth)];
    var data = JSON.stringify(info.map(graphToJson));
    console.timeEnd('channel');
    res.send(data);
  }
}
