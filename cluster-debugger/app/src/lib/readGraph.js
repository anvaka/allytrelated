import getClusters from './clustersViewModel.js'
import fromProtoBuf from 'ngraph.toprotobuf/readPrimitive.js'
import path from 'path'

export default readGraph;

function readGraph(clusterId, folder) {
  var record = getClusters(folder).clusterLookup[clusterId]
  var graph = getGraphFromChunk(record)

  return graph
}

function getGraphFromChunk(record) {
  var chunkPath = getChunkPath(record.chunk)
  var graphsInFile = fromProtoBuf(path.join(chunkPath, 'graph-def.json'))
  return graphsInFile.graphs[record.index]
}

function getChunkPath(chunkId) {
  // todo: later version will not have path stored
  return chunkId
}
