var https = require('https');

var options = {
    "hostname": "www.youtube.com",
    "port": 443,
    "path": "/channel/",
    "method": "GET"
};

exports.handler = function(event, context) {
    var results = [];
    var completed = 0;
    if (!event.channels) {
        context.fail('No channels');
        return;
    }

    var channels = event.channels.split(',');


    var total = channels.length;

    for (var i = 0; i < total; ++i) {
        var localOpt = JSON.parse(JSON.stringify(options));
        localOpt.path += channels[i];
        var req = https.request(localOpt, handle(i, context));
        req.on('error', context.fail);
        req.end();
    }

    function handle(i, context) {
        return function(res) {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                var id = channels[i];
                if (res.statusCode !== 200) {
                    results.push({
                        id: id,
                        error: {
                            statusCode: res.statusCode
                        }
                    });
                } else {
                    results.push(parse(id, body));
                }
                completed += 1;

                if (total === completed) context.succeed(results);
            });
        }
    }
};


function parse(id, html) {
  var related = getRelatedChannels(html);
  var subscribers = getSubscribersCount(html);
  var tags = getTags(html);

  return {
    id: id,
    title: getTitle(html),
    related: related,
    subscribers: subscribers,
    relatedTitle: getRelatedTitle(html)
    // description: getDescription(html),
    // tags: tags
  };
}

function getRelatedTitle(html) {
  var relatedClass = 'branded-page-related-channels branded-page-box yt-card';
  var firstRelated = html.indexOf(relatedClass);
  if (firstRelated < 0) return '';
  var titleClass = 'class="branded-page-module-title" >';
  var title = html.indexOf(titleClass, firstRelated + 1);
  if (title < 0) return '';
  var endOfTitle = html.indexOf('</h2>', title)
  var part = html.substring(title + titleClass.length, endOfTitle);
  if (part) {
    part = part.replace(/^\s+/gm, '').replace(/\s+$/gm, '');
    return part;
  }
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
  var match = html.match(/class="yt-subscription-button-subscriber-count-branded-horizontal subscribed yt-uix-tooltip" title="(.+?)" /);
  return (match && match[1]) || 0;
}

function getRelatedChannels(html) {
  var relatedClass = 'branded-page-related-channels branded-page-box yt-card';
  var firstRelated = html.indexOf(relatedClass);
  if (firstRelated < 0) return;
  var secondRelated = html.indexOf(relatedClass, firstRelated + 1);
  // TODO: this is only required when parsing youtube's ssuggestions
  // if (secondRelated < 0) {
  //   // it means we only have one related channels section:
  //   secondRelated = firstRelated;
  // }
  // var titleIndex = html.indexOf('Related channels', relatedOffset);
  // if (titleIndex < 0) return; // no title;

  var rest;
  if (secondRelated < 0) rest = html.substring(firstRelated);
  else rest = html.substring(firstRelated, secondRelated);
  var related = [];
  var pattern = /<li class="branded-page-related-channels-item  spf-link  clearfix" data-external-id="(.+)">/g;
  var match;
  while ((match = pattern.exec(rest)) !== null) {
    related.push(match[1]);
  }
  return related;
}
