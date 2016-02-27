var Promise = require('bluebird');

module.exports = init;

function init(dbFileName) {
  var db = require('./createDB.js')(dbFileName);
  var Related = require('./related.js')(db);
  var ChannelInfo = require('./channelInfo.js')(db);
  var initPromises = Promise.all([Related.sync(), ChannelInfo.sync()]);

  return initPromises.then(api);

  function api() {
    return {
      add: add,
      exec: exec
    }
  }

  function exec(query) {
    return db.query(query, { type: db.QueryTypes.SELECT });
  }

  function add(channel) {
    var promises = [];
    promises.push(ChannelInfo.upsert({
      id: channel.id,
      title: channel.title,
      relatedTitle: channel.relatedTitle,
      subscribers: getSubscribersCount(channel.subscribers)
    }));

    if (channel.related && channel.related.length) {
      var records = channel.related.map(function (toId) {
        return {
          fromId: channel.id,
          toId: toId
        };
      });
      promises.push(Related.bulkCreate(records, {ignoreDuplicates: true}));
    }
    return Promise.all(promises);
  }
}

function getSubscribersCount(stringOrNumber) {
  if (typeof stringOrNumber === 'number') return stringOrNumber;
  var parsed = parseInt(stringOrNumber.replace(/,/g, ''), 10);
  if (isNaN(parsed)) return 0;
  return parsed;
}
