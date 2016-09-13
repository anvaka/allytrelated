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

export default {
  name: 'graph-view',
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
      // this.renderer = createRenderer(graph);
    },

    deactivate() {
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
      }
    }
  }
}
</script>
