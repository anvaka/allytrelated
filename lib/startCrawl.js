module.exports = startCrawl;
var request = require('request');
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
    if (error && error.statusCode === 404) {
      console.log('Path not found. Probably suspended: ' + path);
      onProcessed(notFound(path));
      scheduleNext();
    } else if (error && error.message && error.message.indexOf('maxRedirects') !== -1) {
      console.log('Max redirects for' + path);
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
    request(url, {
      timeout: 1500
    }, function (error, response, body) {
      if (!error && response && response.statusCode === 200) {
        queue.doneOne();
        processResult(id, body);
      } else if (response && response.statusCode !== 200 && !error) {
        queue.doneOne();
        processError({statusCode: 404}, id);
      } if (error && error.code === 'ETIMEDOUT') {
        console.log('Timed out while quering ' + id + '. Retrying');
        queueUrl(id);
      }
      if (response && response.resume) response.resume();
    });
  }
}
