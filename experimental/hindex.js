var path = require('path');
var save = require('ngraph.tobinary');
var fs = require('fs');

console.log('Parsing graph file...');

var loadGraph = require('../lib/loadGraph.js');

loadGraph('./youtube-worker.json', onGotGraph);

function onGotGraph(graph) {
  console.log('Graph parsed. Found ' + graph.getNodesCount() + ' nodes and ' + graph.getLinksCount() + ' edges');
  var layout = require('hlayout')(graph);
  layout.run();

  var topLevelGroups = layout.getGroupsAtLevel(0);
  saveGroups(topLevelGroups);

  console.log('Layout completed. Saving to binary format');
  saveIteration('positions-s.yt.2d');
  save(graph, { outDir: './data' });
  console.log('Done.');

  function saveGroups(topLevelGroups) {
    var fname = path.join('data', 'groups.bin');
    var nodesLength = graph.getNodesCount();
    var buf = new Buffer(nodesLength * 2);
    var max = Math.pow(2, 16) - 1;
    var i = 0;

    graph.forEachNode(function(node) {
      var idx = i * 2;
      var groupId = topLevelGroups[node.id];
      if (groupId >= max) {
        throw new Error('Too many groups');
      }

      buf.writeInt16LE(groupId, idx);
      i += 1;
    });

    fs.writeFileSync(fname, buf);
  }

  function saveIteration(name) {
    var fname = path.join('data', name + '.bin');

    console.log("Saving: ", fname);
    var nodesLength = graph.getNodesCount();
    var buf = new Buffer(nodesLength * 4 * 3);
    var i = 0;
    var missed = 0;

    graph.forEachNode(function(node) {
      var idx = i * 4 * 3;
      var pos = layout.getNodePosition(node.id);
      if (!pos) {
        missed += 1;
        console.log('missing position for ' + node.id);
        pos = {x : 0, y: 0};
      }

      var size = 0;
      var links = graph.getLinks(node.id);
      if (links) {
        links.forEach(function(link) {
          if (link.toId === node.id) size += 1;
        });
      }

      buf.writeInt32LE(pos.x, idx);
      buf.writeInt32LE(pos.y, idx + 4);
      buf.writeInt32LE(size, idx + 8);
      i++;
    });

    fs.writeFileSync(fname, buf);
    console.log('missed: ', missed);
  }
}

