module.exports = startCrawl;
var rp = require('request-promise');
var prefix = 'https://www.youtube.com/channel/';

function startCrawl(queue, onProcessed) {
  var counter = 0;

  scheduleNext();

  function processResult(error, path, html) {
    console.log(counter + '. ' + prefix + path);
    if (error) {
      if (error.statusCode === 404) {
        console.log('Path not found. Probably suspended: ' + path);
        onProcessed(notFound(path));
        scheduleNext();
      } else {
        console.error('Unknown error', error);
      }
      return;
    }
    if (counter % 100 === 0) {
      console.log('Processed so far: ' + counter + '; queue size: ' + queue.length);
    }
    counter += 1;
    var page = collectChannelInfo(path, html);
    onProcessed(page);
    scheduleNext();
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
        processResult(null, id, html);
      }).catch(function(err) {
        processResult(err, id)
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
    return html.match(/property="og:title" content="(.+)">/)[1];
  }

  function getDescription(html) {
    return html.match(/property="og:description" content="(.+)">/)[1];
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
    return html.match(/class="yt-subscription-button-subscriber-count-branded-horizontal yt-uix-tooltip" title="(.+?)" /)[1];
  }

  function getRelatedChannels(html) {
    var relatedClass = 'branded-page-related-channels branded-page-box yt-card';
    var firstRelated = html.indexOf(relatedClass);
    if (firstRelated < 0) return;
    var relatedOffset = html.indexOf(relatedClass, firstRelated);
    if (relatedOffset < 0) return;
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
