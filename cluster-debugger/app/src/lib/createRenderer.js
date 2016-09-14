export default createRenderer
import render from './renderer/render.js'
import internalLayout from './internalLayout.js'

function createRenderer(dgraph, domContainer) {
  internalLayout(dgraph)

  return render(dgraph, domContainer)
}
