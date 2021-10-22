<template>
  <div id="app">
    <maps/>
  </div>
</template>

<script>
import maps from './components/INNA_maps.vue'

export default {
  name: 'App',
  components: {
    maps
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
