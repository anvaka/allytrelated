<template>
  <div>
    <h1>Viewing clustter!</h1>
    <div>
    <code>{{$route.query.folder}}</code>
    </div>
    <router-link class="waves-effect waves-light btn" to="/">Go Back</router-link>
  </div>
</template>

<script>
export default {
  components: { },
  name: 'view-cluster'
}
</script>
