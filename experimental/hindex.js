var path = require('path');
var save = require('ngraph.tobinary');
var fs = require('fs');

var nativeClusters = require('ngraph.louvain/native.js').fromNgraph;
var hlayout = require('hlayout');

console.log('Parsing graph file...');

var loadGraph = require('../lib/loadGraph.js');

loadGraph('./youtube-worker-jul31.json', onGotGraph, addSubscribers);

function onGotGraph(graph) {
  console.log('Graph parsed. Found ' + graph.getNodesCount() + ' nodes and ' + graph.getLinksCount() + ' edges');
  var layout = hlayout(graph, nativeClusters);
  layout.run();

  var topLevelGroups = layout.getGroupsAtLevel(0);
  saveGroups(topLevelGroups);

  console.log('Layout completed. Saving to binary format');
  saveIteration('positions-s.yt.2d');
  save(graph, { outDir: './data' });
  console.log('Done.');

  function saveIteration(name) {
    var fname = path.join('data', name + '.bin');

    console.log("Saving: ", fname);
    var nodesLength = graph.getNodesCount();
    var recordsCount = 4;
    var recordSize = 4;

    var buf = new Buffer(nodesLength * recordSize * recordsCount);
    var i = 0;
    var missed = 0;
    debugger;

    graph.forEachNode(function(node) {
      var idx = i * recordsCount * recordSize;
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

      var subscribers = node.data || 0;

      buf.writeInt32LE(pos.x, idx); idx += recordSize;
      buf.writeInt32LE(pos.y, idx); idx += recordSize;
      buf.writeInt32LE(size, idx); idx += recordSize;
      buf.writeInt32LE(subscribers, idx);
      i++;
    });

    fs.writeFileSync(fname, buf);
    console.log('missed: ', missed);
  }

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
}

function addSubscribers(channel) {
  if (channel.error) return;

  if (channel.subscribers === undefined) {
    console.log('Could not find subscribers for ' + channel.id);
    return 0;
  }
  if (typeof channel.subscribers === 'number') {
    // 0 is treated as number by JSON parser
    return channel.subscribers;
  }

  var subscribersStringValue = channel.subscribers.replace(/,/g, '');

  var count = parseInt(subscribersStringValue, 0);
  if (Number.isNaN(count)) {
    console.log('Could not parse subscribers for ' + channel.id + '; This is not a number: ' + subscribersStringValue);
    return 0;
  }

  return count;
}
