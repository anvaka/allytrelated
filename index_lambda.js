// this script uses Lambda from aws to crawl. Highly experimental and is not intended for replication

var outFileName = 'youtube-worker-jul31.json';
var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var download = require('./lib/downloadLambda.js');
var outgoing;

var maxWorkerCount = 2;
var channelsPerWorker = 30;
var activeWorker = 0;

var seen = new Set();
readProcessedFile(outFileName, crawl);

function crawl(queue, processedRowsCount) {
  downloadMore();

  function chunkDownloaded(chunk, workerId, timeMS) {
    if (typeof chunk.forEach !== 'function') {
      console.log('What are you: ' + chunk + '?');
      throw new Error('somehow no forEach in chunk')
    }
    chunk.forEach(channelDownloaded);
    activeWorker -= 1;
    processedRowsCount += chunk.length;
    console.log(workerId + ' <- Done in ' + timeMS + 'ms! Stats (downloaded/enqueued): ' + processedRowsCount + '/' + seen.size);
    downloadMore(workerId);
  }

  function channelDownloaded(channel) {
    seen.add(channel.id);
    write(channel);
    enqueueRelated(queue, channel);
  }

  function downloadMore(id) {
    while (activeWorker < maxWorkerCount && queue.length > 0) {
      activeWorker += 1;
      var channels = queue.splice(0, channelsPerWorker)
      download(channels, chunkDownloaded, id || activeWorker);
    }
  }
}

function write(page) {
  if(!outgoing) {
    createOutStream();
  }

  outgoing.write(page);
}

function createOutStream() {
  outgoing = JSONStream.stringify(false);
  var fileStream = fs.createWriteStream(outFileName, {
    encoding: 'utf8',
    flags: 'a'
  });
  outgoing.pipe(fileStream);
}

function enqueueRelated(queue, page) {
  if (page.error) {
    console.log('Failed to download ' + page.id, page.error);
    return;
  }
  var related = page.related;
  if (!related || related.length === 0) return;
  for (var i = 0; i < related.length; ++i) {
    var channel = related[i];
    if (!channel) {
      console.log('missing related for ' + JSON.stringify(page));
      throw 'blah';
    }
    var alreadySeen = seen.has(channel);
    if (!alreadySeen) {
      // make sure we are not adding anything already queued.
      seen.add(channel);
      queue.push(channel);
    }
  }
}

function readProcessedFile(fileName, done) {
  if (!fs.existsSync(fileName)) {
    startFromTotalBiscuit(done);
    return;
  }
  var queue = [];
  var processedRowsCount = 0;

  console.log('Parsing processed list...');
  var parser = JSONStream.parse();
  fs.createReadStream(fileName)
    .pipe(parser)
    .pipe(es.mapSync(markProcessed))
    .on('end', fileInitialized);

  function markProcessed(pkg) {
    processedRowsCount += 1;
    seen.add(pkg.id);
  }

  function fileInitialized() {
    // on the second pass we will go into each related channel and queue it up
    // if it was not already indexed.
    console.log('Restoring download queue...');
    var parser = JSONStream.parse();
    fs.createReadStream(fileName)
      .pipe(parser)
      .pipe(es.mapSync(addToQueue))
      .on('end', reportDone);
  }

  function reportDone() {
    console.log('Processed: ' + processedRowsCount );
    console.log('Enqueued: ' + queue.length);
    done(queue, processedRowsCount);
  }

  function addToQueue(pkg) {
    if (!pkg.related) return;
    enqueueRelated(queue, pkg);
  }
}

function startFromTotalBiscuit(cb) {
  setTimeout(function() {
    cb(['UCy1Ms_5qBTawC-k7PVjHXKQ'], 0);
  }, 0);
}
