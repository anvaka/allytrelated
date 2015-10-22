var Crawler = require("crawler");
var url = require('url');
var knownPages = new Set();

var c = new Crawler({
  maxConnections: 1,
  // This will be called for each crawled page
  callback: function(error, result, $) {
    if (error) {
      console.error('noooo', error);
      return;
    }
    var name = getName(result.request.path);
    console.log(name);
    // $ is Cheerio by default
    //a lean implementation of core jQuery designed specifically for the server
    var related = $('.branded-page-related-channels');
    if (related && related.length > 0) {
      var lastRelated = $(related[related.length - 1]);
      var header = lastRelated.find('h2');
      assertRelated(header.text());
      var link = lastRelated.find('.yt-uix-tile-link');
      link.each(function(index, a) {
        var $a = $(a);
        var toQueueUrl = $a.attr('href');
        var id = getName(toQueueUrl);
        console.log(' ' + id  + ' ' + $a.text());
        if (knownPages.has(id)) {
          return;
        }
        knownPages.add(id);
        c.queue('https://www.youtube.com' + toQueueUrl);
      });
    } else {
      console.error('No related channels');
    }
  },
  onDrain: function() {
    console.error('Done!');
    process.exit(0);
  }
});

// Queue just one URL, with default callback
c.queue('https://www.youtube.com/channel/UCy1Ms_5qBTawC-k7PVjHXKQ');
function assertRelated(text) {
  if (!typeof text === 'string') {
    throw new Error('related is supposed to be a text');
  }
  if (text.indexOf('Related channels') < 0) {
    throw new Error('The last related group is not a related channel');
  }
}

function getName(path) {
  return path.substring(path.lastIndexOf('/') + 1, path.length);
}
