var fs = require('fs');
var fileName = process.argv[2] || './youtube-user.json';

var forEachChannel = require('./lib/forEachChannel.js');

var channelToId = new Map();
var channels = [];

forEachChannel(fileName, visit, done);

function visit(channel) {
  ensureAdded(channel.id);
  var related = channel.related;
  var fromId = channelToId.get(channel.id);

  var suggestedByYoutube = (channel.relatedTitle === 'Popular channels' ||
                            channel.relatedTitle === 'Related channels');
  if (related && !suggestedByYoutube) {
    for (var i = 0; i < related.length; ++i) {
      ensureAdded(related[i]);
      console.log(fromId + ' ' + channelToId.get(related[i]));
    }
  }
}

function ensureAdded(channelId) {
  if (channelToId.has(channelId)) return;

  var index = channels.length;
  channelToId.set(channelId, index);
  channels.push(channelId);
}

function done() { 
  fs.writeFileSync('./data/channelId.json', JSON.stringify(channels))
}
