<template>
  <div id="app">
    <navigation/>
    <router-view/>
  </div>
</template>
<script>

import Nav from "./components/Nav"

export default {
  name: "App",
  data() {
    return { users: [] };
  },
  components: {navigation : Nav},
  methods: {
    leaveRoom() {
      this.$socket.emit("leave_room");
    }
  },
  sockets:{
    room_created(id) {
      this.$router.push({ name: "room", params: { id: id } });
    }},
  watch: {
    $route(to, from) {
      console.log(from);
      if (from.name == "room") {
        this.leaveRoom();
      }
    }
  }
};
</script>
<style>
#app {

  margin: 0;
}
</style>