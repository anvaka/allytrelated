var outFileName = 'youtube.json';
var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var startCrawl = require('./lib/startCrawl.js');
var outgoing;
// we will use bloom filter to check whether website is already indexed.
var bloom = initBloomFilter();
readProcessedFile(outFileName, crawl);

function crawl(queue, processedRows) {
  startCrawl(queue, onProcessed, processedRows);

  function onProcessed(page) {
    bloom.add(page.id);
    write(page);
    enqueueRelated(page.related, queue);
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

function enqueueRelated(related, queue) {
  if (!related || related.length === 0) return;
  for (var i = 0; i < related.length; ++i) {
    if (!bloom.test(related[i]) && queue.length < 100000) {
      // we will cap our queue at 100,000 channels. Subsequent reruns should catch missing channels
      queue.push(related[i]);
      // make sure we are not adding anything already queued.
      bloom.add(related[i]);
    }
  }
}

function readProcessedFile(fileName, done) {
  if (!fs.existsSync(fileName)) {
    startFromTotalBiscuit(done);
    return;
  }
  var queue = [];
  var processedRows = 0;

  console.log('parsing processed list...');
  var parser = JSONStream.parse();
  fs.createReadStream(fileName)
    .pipe(parser)
    .pipe(es.mapSync(markProcessed))
    .on('end', bloomInitialized);

  function markProcessed(pkg) {
    processedRows += 1;
    bloom.add(pkg.id);
  }

  function bloomInitialized() {
    // on the second pass we wil go into each related channel and queue it up
    // if it was not already indexed.
    var parser = JSONStream.parse();
    fs.createReadStream(fileName)
      .pipe(parser)
      .pipe(es.mapSync(addToQueue))
      .on('end', reportDone);
  }

  function reportDone() {
    console.log('Processed: ' + processedRows );
    console.log('Enqueued: ' + queue.length);
    done(queue, processedRows);
  }

  function addToQueue(pkg) {
    if (!pkg.related) return;
    enqueueRelated(pkg.related, queue);
  }
}

function startFromTotalBiscuit(cb) {
  setTimeout(function() {
    cb(['UCy1Ms_5qBTawC-k7PVjHXKQ'], 0);
  }, 0);
}

function initBloomFilter() {
  var BloomFilter = require('bloomfilter').BloomFilter;
  var bloom = new BloomFilter(
    1024 *1024 * 9, // number of bits to allocate.
    66        // number of hash functions.
  );
  return bloom;
}
