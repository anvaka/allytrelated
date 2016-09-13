import path from 'path'
import fs from 'fs'

export default getClusters

let cachedClusters = {}

function getClusters(clustersPath) {
  let clusters = cachedClusters[clustersPath]
  if (clusters) return clusters

  let config = path.join(clustersPath, 'index.json')
  let configText = fs.readFileSync(config, 'utf8')
  let clusterIndex = JSON.parse(configText)
  let {clusterInfo} = clusterIndex
  clusters = Object.keys(clusterInfo).map(x => {
    let cluster = clusterInfo[x]
    cluster.id = x
    return cluster
  }).sort(byNodesAndLinks)

  cachedClusters[path] = clusters
  return clusters
}

function byNodesAndLinks(a, b) {
  let result = b.nodes - a.nodes
  if (result) return result

  return b.edges - a.edges
}
