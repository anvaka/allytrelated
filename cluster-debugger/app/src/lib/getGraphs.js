import path from 'path'
import {readGraphFromFile} from './readGraph.js'

export default getGraphs

let cachedGraphs = {}

function getGraphs(graphPath) {
  let graphs = cachedGraphs[graphPath]
  if (graphs) return graphs

  let graphDef = path.join(graphPath, 'graph-def.json')
  graphs = readGraphFromFile(graphDef)

  cachedGraphs[path] = graphs

  return graphs
}
