<style scoped>
  img {
    margin-top: -25px;
    width: 450px;
  }
</style>

<template>
  <div>
    <h1>Welcome to clusters debugger</h1>
    <a class="waves-effect waves-light btn" v-on:click="openClustersFolder">Open Cluster Folder</a>
  </div>
</template>

<script>
import {remote} from 'electron'

export default {
  components: { },
  name: 'landing-page',
  methods: {
    openClustersFolder() {
      const {dialog} = remote
      let clsuterFolder = dialog.showOpenDialog({properties: ['openDirectory']})
      if (clsuterFolder) {
        this.$router.push({
          path: '/view-cluster',
          query: {
            folder: clsuterFolder[0]
          }
        })
      }
    }
  }

}
</script>
