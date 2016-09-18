<style scoped>
  img {
    margin-top: -25px;
    width: 450px;
  }

  .welcome-screen {
    align-items: center;
    background:
      radial-gradient(
        ellipse at center,
        rgba(255, 255, 255, 1) 0%,
        rgba(229, 229, 229, .85) 100%
      );
    background-position: center;
    display: flex;
    font-family: Lato, Helvetica, sans-serif;
    justify-content: center;
    text-align: center;
    height: 100%;
  }
</style>

<template>
  <div class='welcome-screen'>
    <div class='content'>
      <h1>Welcome to clusters debugger</h1>
      <a class="waves-effect waves-light btn" v-on:click="openClustersFolder">Open Cluster Folder</a>
      <a class="waves-effect waves-light btn" v-on:click="openGraphFile">Open Grpah File</a>
    </div>
  </div>
</template>

<script>
import {remote} from 'electron'

export default {
  name: 'landing-page',
  methods: {
    openClustersFolder() {
      const {dialog} = remote
      let clsuterFolder = dialog.showOpenDialog({properties: ['openDirectory']})
      if (clsuterFolder) {
        this.$router.go({
          path: '/view-cluster',
          query: {
            folder: clsuterFolder[0]
          }
        })
      }
    },

    openGraphFile() {
      const {dialog} = remote
      let clsuterFolder = dialog.showOpenDialog({properties: ['openDirectory']})
      if (clsuterFolder) {
        this.$router.go({
          path: '/view-graph',
          query: {
            folder: clsuterFolder[0]
          }
        })
      }
    }
  }

}
</script>
