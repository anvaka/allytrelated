/**
 * Prerequisites: Youtube is indexed by
 * node index.js
 */
var path = require('path');
var save = require('ngraph.tobinary');
var fileName = process.argv[2] || './youtube-user.json';

console.log('This program saves graph into binary file');
console.log('Loading raph from ' + fileName + '...');

require('./lib/loadGraph.js')(fileName, start);

function start(graph) {
  save(graph, {
    outDir: path.join(__dirname, 'data'),
    labels: 'labels.json', // name of the labels file. labels.json by default
    meta: 'meta.json', // name of the file with meta information. meta.json by default
    links: 'links.bin' // file name for links array. links.bin by default
  });
}
