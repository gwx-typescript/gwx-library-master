<template>
  <v-app>
    <AppBar></AppBar>
    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import AppBar from './components/AppBar'

export default {
  name: 'App',

  components: {
    AppBar
  },

  data: () => ({
  })
}
</script>

<style scoped>
#app {
  background-color: #fafafa;
}
a {
  color: white;
  text-decoration: none;
}
</style>
