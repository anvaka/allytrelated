<style scoped>
  .clusters-list {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .clusters-main-view {
    overflow: hidden;
    height: 100%;
    margin: 0;
    display: flex;
  }
  .side-bar {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    width: 240px;
  }
  .cluster-item {
    border-bottom: 1px solid gray;
  }
  .graph-view {
    flex: 1;
    position: relative;
  }
  .scene {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
</style>

<template>
  <div class='clusters-main-view'>
    <div class='side-bar'>
      <code>{{$route.query.folder}}</code>
      <h4>Largest graphs</h4>
      <div class='clusters-list'>
        <a v-for="graph in graphs" class="cluster-item" v-on:click='openGraph(graph)'>
            <span>Nodes:</span>
            <strong>{{ graph.nodes.length }}</strong>
            <span>Edges:</span>
            <strong>{{ graph.links.length }}</strong>
        </a>
      </div>
    </div>
    <div class='graph-view'>
      <a class="waves-effect waves-light btn" v-link="{path: '/', append: false}">Go Back</a>
      <div class='scene' v-el:scene></div>
    </div>
  </div>
</template>

<script>
import getGraphs from '../lib/getGraphs.js'
import createRenderer from '../lib/createRenderer'
import {convertToD3Graph} from '../lib/readGraph.js'

export default {
  components: { },
  name: 'view-graph',
  computed: {
    graphs() {
      return getGraphs(this.$route.query.folder).graphs.sort(byDegree).slice(0, 100)
    }
  },
  methods: {
    openGraph(graph) {
      if (this.renderer) {
        this.renderer.dispose()
        this.renderer = null
      }

      let g = convertToD3Graph(graph)
      this.renderer = createRenderer(g, this.$els.scene)
    }
  }
}

function byDegree(x, y) {
  return y.nodes.length - x.nodes.length
}
</script>
