import createGraph from 'ngraph.graph'
import todot from 'ngraph.todot'
import {clipboard} from 'electron'

export default exportToDot

function exportToDot(graph) {
  var g = createGraph({uniqueLinkIds: false})

  graph.nodes.forEach(n => {
    g.addNode(n.index)
  })
  graph.links.forEach(link => {
    var from = link.source.index
    var to = link.target.index

    if (from !== to) g.addLink(from, to)
  })

  clipboard.writeText(todot(g))
}
