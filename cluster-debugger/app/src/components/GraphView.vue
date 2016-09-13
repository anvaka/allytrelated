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
export default {
  name: 'graph-view',
  route: {
    data() {
      console.log('Data called on ' + this.$route.params.clusterId)
    },
    deactivate() {
      console.log('Deactivate called on ' + this.$route.params.clusterId)
    }
  }
}
</script>
