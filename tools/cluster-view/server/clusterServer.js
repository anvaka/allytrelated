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
    var channelId = req.query.channelId;
    console.log('Returning graph for: ' + channelId);
    var info = clusters.getNodeClusterGraph(channelId);
    res.send(tojson(info));
  });

  var server = app.listen(3001, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
}
