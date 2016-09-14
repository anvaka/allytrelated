<style>
.graph-view {
  background: pink;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
}
</style>
<template>
<div class='graph-view'>
  <h3>{{$route.params.clusterId}}</h3>
</div>
</template>
<script>
import readGraph from '../lib/readGraph.js'
import createRenderer from '../lib/createRenderer'

export default {
  name: 'graph-view',
  ready() {
    if (this.pendingGraph) {
      this.renderer = createRenderer(this.pendingGraph, this.$el)
      this.pendingGraph = null
    }
  },
  route: {
    data() {
      if (this.renderer) {
        this.renderer.dispose()
        this.renderer = null
      }
      let clusterId = this.$route.params.clusterId
      let folder = this.$route.query.folder
      var graph = readGraph(clusterId, folder)
      console.log(graph.nodes.length, graph.links.length)
      if (this.$el.parentElement === null) {
        this.pendingGraph = graph
        return
      }
      this.renderer = createRenderer(graph, this.$el)
    },

    deactivate() {
      if (this.renderer) {
        this.renderer.dispose()
        this.renderer = null
      }
    }
  }
}
</script>
