let threePanZoom = require('three.map.control')
let THREE = require('three')

export default render

function render(dgraph, container) {
  var max = 2000
  var camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, max)

  var scene = new THREE.Scene()

  var controls = threePanZoom(camera, container)
  controls.max = max

  scene.add(camera)

  var renderer = makeThreeRenderer()
  renderPoints()

  var ambientLight = new THREE.AmbientLight(0x000000)
  scene.add(ambientLight)

  var lastFrame = window.requestAnimationFrame(frame)
  window.addEventListener('resize', onWindowResize, false)

  return {
    dispose
  }

  function onWindowResize(e) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function renderPoints() {
    dgraph.links.forEach(edge => {
      var material = new THREE.LineBasicMaterial({
        color: 0x0000ff
      })

      var from = edge.source
      var to = edge.target
      if (from.x === to.x && from.y === to.y) {
        return
      }

      var geometry = new THREE.Geometry()
      geometry.vertices.push(new THREE.Vector3(from.x, from.y, 0))
      geometry.vertices.push(new THREE.Vector3(to.x, to.y, 0))

      var line = new THREE.Line(geometry, material)
      scene.add(line)
    })

    dgraph.nodes.forEach(node => {
      var geometry = new THREE.CircleGeometry(5, 32)
      var material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
      var circle = new THREE.Mesh(geometry, material)
      circle.position.x = node.x
      circle.position.y = node.y

      scene.add(circle)
    })
    camera.position.z = 30
  }

  function dispose() {
    window.cancelAnimationFrame(lastFrame)
    window.removeEventListener('resize', onWindowResize, false)

    controls.dispose()
    container.removeChild(renderer.domElement)
    renderer.dispose()
  }

  function frame(/* time */) {
    lastFrame = window.requestAnimationFrame(frame)
    renderer.render(scene, camera)
  }

  function makeThreeRenderer() {
    var renderer = new THREE.WebGLRenderer({
      antialias: true
    })

    renderer.setClearColor(0x000000, 1)
    renderer.setSize(container.clientWidth, container.clientHeight)

    container.appendChild(renderer.domElement)

    return renderer
  }
}
