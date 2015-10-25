module.exports = startCrawl;
var rp = require('request-promise');
var prefix = 'https://www.youtube.com/channel/';

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
    var page = collectChannelInfo(path, html);
    }catch (e) {
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
    if (queue.length > 0) {
      var id = queue.shift();
      queueUrl(id);
    } else {
      console.log('Nothing left. We are done');
    }
  }

  function queueUrl(id) {
    var url = prefix + id;
    rp(url)
      .then(function(html) {
        processResult(id, html);
      }).catch(function(err) {
        processError(err, id)
      });
  }

  function isRelated(text) {
    if (!typeof text === 'string') {
      throw new Error('related is supposed to be a text');
    }
    return text.indexOf('Related channels') > -1;
  }

  function collectChannelInfo(id, html) {
    var related = getRelatedChannels(html);
    var subscribers = getSubscribersCount(html);
    var tags = getTags(html);

    return {
      id: id,
      title: getTitle(html),
      description: getDescription(html),
      related: related,
      subscribers: subscribers,
      tags: tags
    };
  }

  function getTitle(html) {
    var match = html.match(/property="og:title" content="(.+)">/);
    return (match && match[1]) || '';
  }

  function getDescription(html) {
    var match = html.match(/property="og:description" content="(.+)">/);
    return (match && match[1]) || '';
  }

  function getTags(html) {
    var tags = [];
    var pattern = /property="og:video:tag" content="(.+)">/g;
    var match;
    while ((match = pattern.exec(html)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  }

  function getSubscribersCount(html) {
    var match = html.match(/class="yt-subscription-button-subscriber-count-branded-horizontal yt-uix-tooltip" title="(.+?)" /);
    return (match && match[1]) || 0;
  }

  function getRelatedChannels(html) {
    var relatedClass = 'branded-page-related-channels branded-page-box yt-card';
    var firstRelated = html.indexOf(relatedClass);
    if (firstRelated < 0) return;
    var relatedOffset = html.indexOf(relatedClass, firstRelated);
    if (relatedOffset < 0) {
      // it means we only have one related channels section:
      relatedOffset = firstRelated;
    }
    var titleIndex = html.indexOf('Related channels', relatedOffset);
    if (titleIndex < 0) return; // no title;

    var rest = html.substring(titleIndex);
    var related = [];
    var pattern = /<li class="branded-page-related-channels-item  spf-link  clearfix" data-external-id="(.+)">/g;
    var match;
    while ((match = pattern.exec(rest)) !== null) {
      related.push(match[1]);
    }
    return related;
  }
}
