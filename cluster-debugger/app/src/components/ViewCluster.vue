<style scoped>
  .clusters-list {
    overflow-y: auto;
    flex: 1;
  }
  .clusters-main-view {
    overflow: hidden;
    height: 100%;
    margin: 0;
  }
  .side-bar {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  .cluster-item {
    border-bottom: 1px solid gray;
  }
</style>

<template>
  <div class='row clusters-main-view'>
    <div class='col s4 side-bar'>
      <code>{{$route.query.folder}}</code>
      <h4>Largest subgraphs</h4>
      <div class='clusters-list'>
        <a v-for="cluster in clusters" class="cluster-item">
          <div>
            <div>Nodes:</div>
            <div>{{ cluster.nodes }}</div>
          </div>
          <div>
            <div>Edges:</div>
            <div>{{ cluster.edges }}</div>
          </div>
        </a>
      </div>
    </div>
    <div class='col s8'>
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
