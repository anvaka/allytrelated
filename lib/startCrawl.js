module.exports = startCrawl;
var Crawler = require("crawler");
var prefix = 'https://www.youtube.com/';

function startCrawl(queue, onProcessed) {
  var counter = 0;
  var c = new Crawler({
    maxConnections: 1,
    // This will be called for each crawled page
    callback: function(error, result, $) {
      console.log(result.request.path);
      if (error) {
        console.error('noooo', error);
        return;
      }
      if (counter % 100 === 0) {
        console.log('Processed so far: ' + counter + '; queue size: ' + queue.length);
      }
      counter += 1;
      // $ is Cheerio by default
      //a lean implementation of core jQuery designed specifically for the server
      var page = collectChannelInfo(result.request.path, $);
      onProcessed(page);
      scheduleNext();
    },
    onDrain: function() {
//      process.exit(0);
    }
  });

  scheduleNext();

  function scheduleNext() {
    if (queue.length > 0) {
      var id = queue.shift();
      var url = prefix + id;
      c.queue(url);
    } else {
      console.log('Nothing left. We are done');
    }
  }

  function isRelated(text) {
    if (!typeof text === 'string') {
      throw new Error('related is supposed to be a text');
    }
    return text.indexOf('Related channels') > -1;
  }

  function collectChannelInfo(id, $) {
    var related = getRelatedChannels($);
    var subscribers = getSubscribersCount($);
    var tags = getTags($);

    return {
      id: id.substring(1),
      title: getTitle($),
      description: getDescription($),
      related: related,
      subscribers: subscribers,
      tags: tags
    };
  }

  function getTitle($) {
    return $('meta[property="og:title"]').attr('content');
  }

  function getDescription($) {
    return $('meta[property="og:description"]').attr('content');
  }

  function getTags($) {
    var tags = [];
    $('meta[property="og:video:tag"]').each(function(index, meta) {
      tags.push(meta.attribs.content);
    });
    return tags;
  }

  function getSubscribersCount($) {
    return $('.yt-subscription-button-subscriber-count-branded-horizontal.yt-uix-tooltip').text();
  }

  function getRelatedChannels($) {
    var related = $('.branded-page-related-channels');
    if (related && related.length > 0) {
      var lastRelated = $(related[related.length - 1]);
      // There can be several related options. Using only those suggested by YouTube:
      var header = lastRelated.find('h2');
      if (isRelated(header.text())) {
        var related = [];
        var link = lastRelated.find('.yt-uix-tile-link');
        link.each(function(index, a) {
          var $a = $(a);
          var relatedId = $a.attr('href').substring(1);
          related.push(relatedId);
        });
        return related;
      }
    }
  }
}
