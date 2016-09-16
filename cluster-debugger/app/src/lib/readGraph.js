import getClusters from './clustersViewModel.js'
import path from 'path'

export default readGraph

function readGraph(clusterId, folder) {
  var record = getClusters(folder).clusterLookup[clusterId]
  var graph = getGraphFromChunk(record)

  printDegreeDistribution(graph)

  return graph
}

function getGraphFromChunk(record) {
  var chunkPath = record.chunkPath
  var fromProtoBuf = require('ngraph.toprotobuf/readPrimitive.js')
  var graphsInFile = fromProtoBuf(path.join(chunkPath, 'graph-def.json'))
  var graph = graphsInFile.graphs[record.index]

  return {
    nodes: graph.nodes.map(n => ({ index: n.id })),
    links: graph.links.map(l => ({
      source: l.from,
      target: l.to
    }))
  }
}

function printDegreeDistribution(graph) {
  var counts = new Map()

  graph.links.forEach(l => {
    increment(l.source)
    increment(l.target)
  })

  console.log(Array.from(counts.values()).sort((x, y) => y - x))

  function increment(id) {
    var value = counts.get(id) || 0
    counts.set(id, value + 1)
  }
}
