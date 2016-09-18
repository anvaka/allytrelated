import getClusters from './clustersViewModel.js'
import path from 'path'

export default readGraph

function readGraph(clusterId, folder) {
  var record = getClusters(folder).clusterLookup[clusterId]
  let graphsInFile = getGraphFromChunk(record)
  var graph = graphsInFile.graphs[record.index]

  printDegreeDistribution(graph)

  return convertToD3Graph(graph)
}

function getGraphFromChunk(record) {
  var chunkPath = record.chunkPath
  var graphFile = path.join(chunkPath, 'graph-def.json')

  return readGraphFromFile(graphFile)
}

export function convertToD3Graph(graph) {
  return {
    nodes: graph.nodes.map(n => ({ index: n.id })),
    links: graph.links.map(l => ({
      source: l.from,
      target: l.to
    }))
  }
}

export function readGraphFromFile(graphFile) {
  var fromProtoBuf = require('ngraph.toprotobuf/readPrimitive.js')
  return fromProtoBuf(graphFile)
}

export function printDegreeDistribution(graph) {
  var counts = new Map()

  graph.links.forEach(l => {
    if (l.source !== l.target) {
      increment(l.source)
      increment(l.target)
    }
  })

  console.log(Array.from(counts.values()).sort((x, y) => y - x))

  function increment(id) {
    var value = counts.get(id) || 0
    counts.set(id, value + 1)
  }
}
