/**
 * Parses youtube response and finds what's related to a channel
 */
module.exports = parse;

function parse(id, html) {
  var related = getRelatedChannels(html);
  var subscribers = getSubscribersCount(html);
  var tags = getTags(html);

  return {
    id: id,
    title: getTitle(html),
    related: related,
    subscribers: subscribers
    // description: getDescription(html),
    // tags: tags
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
