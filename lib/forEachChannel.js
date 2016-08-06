/**
 * iterates over json array of channels, stored by the indexer
 */
module.exports = forEachChannel;

var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');

function forEachChannel(fileName, cb, done) {
  if (!fs.existsSync(fileName)) {
    console.error('No data file: ' + fileName);
    console.error('Make sure to index youtube first with `node index.js` command');
    process.exit(-1);
  }

  var jsonStreamParser = JSONStream.parse();
  fs.createReadStream(fileName)
    .pipe(jsonStreamParser)
    .pipe(es.mapSync(cb))
    .on('end', done);
}
