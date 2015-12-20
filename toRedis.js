var Redis = require('ioredis');
var redis = new Redis();
var stats = {
  total: 0,
  noSub: 0,
  noRel: 0
};

redis.on('connect', forwardData);
redis.on('error', function(e) {
  console.log('Could not connect to redis server. Make sure to run redis-server on default port');
  process.exit(-1);
});

function forwardData() {
  var fileName = process.argv[2] || './youtube-user.json';

  console.log('This program saves graph into redis server');
  console.log('Loading raph from ' + fileName + '...');

  var forEachChannel = require('./lib/forEachChannel.js');
  forEachChannel(fileName, addToRedis, done);

  function addToRedis(channel) {
    stats.total += 1;
    if (stats.total % 50000 === 0) {
      printStat();
    }
    var key = 'c:' + channel.id;
    redis.hset(key, 'title', channel.title);
    redis.hset(key, 'kind', channel.relatedTitle);
    if (channel.related) {
      redis.hset(key, 'related', channel.related.join(','));
    } else {
      stats.noRel += 1;
    }
    if (channel.subscribers) {
      var subscribers = parseInt(channel.subscribers.replace(/,/g, ''), 10);
      if (isNaN(subscribers)) {
        throw new Error ('could not parse subscribers for ' + channel.id);
      }
      redis.hset(key, 'subscribers', subscribers);
    } else {
      stats.noSub += 1;
    }
  }
}

function done() {
  console.log('Everything is done! You can Ctrl + C');
  printStat();
}

function printStat() {
  console.log('Processed: ' + stats.total + '; No subscribers: ' + stats.noSub + '; No related: ' + stats.noRel);
}
