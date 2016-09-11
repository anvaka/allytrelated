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
  }
</style>

<template>
  <div class='clusters-main-view'>
    <div class='side-bar'>
      <code>{{$route.query.folder}}</code>
      <h4>Largest subgraphs</h4>
      <div class='clusters-list'>
        <a v-for="cluster in clusters" class="cluster-item">
            <span>Nodes:</span>
            <strong>{{ cluster.nodes }}</strong>
            <span>Edges:</span>
            <strong>{{ cluster.edges }}</strong>
        </a>
      </div>
    </div>
    <div class='graph-view'>
      <router-link class="waves-effect waves-light btn" to="/">Go Back</router-link>
    </div>
  </div>
</template>

<script>
import getClusters from '../lib/clustersViewModel.js'

export default {
  components: { },
  name: 'view-cluster',
  computed: {
    clusters() {
      return getClusters(this.$route.query.folder).slice(0, 100)
    }
  }

}
</script>
