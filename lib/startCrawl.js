module.exports = startCrawl;
var rp = require('request-promise');
var prefix = 'https://www.youtube.com/channel/';
var parse = require('./parser.js');

function startCrawl(queue, onProcessed, counter) {
  counter = counter || 0;

  scheduleNext();

  function processResult(path, html) {
    counter += 1;
    if (counter % 100 === 0) {
      console.log('Processed so far: ' + counter + '; queue size: ' + queue.length);
    }
    console.log(counter + '. ' + prefix + path);
    try {
      var page = parse(path, html);
    } catch (e) {
      console.log(e, e.stack);
      throw e;
    }
    onProcessed(page);
    scheduleNext();
  }

  function processError(error, path) {
    if (error.statusCode === 404) {
      console.log('Path not found. Probably suspended: ' + path);
      onProcessed(notFound(path));
      scheduleNext();
    } else {
      console.error('Unknown error', error);
    }
  }

  function notFound(id) {
    return {
      id: id,
      error: true
    }
  }

  function scheduleNext() {
    var id;
    while ((id = queue.shift())) {
      queueUrl(id);
    }
    if (queue.length === 0) {
      console.log('Nothing left. We are done');
    }
  }

  function queueUrl(id) {
    var url = prefix + id;
    rp(url)
      .then(function(html) {
        queue.doneOne();
        processResult(id, html);
      }).catch(function(err) {
        queue.doneOne();
        processError(err, id)
      });
  }
}
