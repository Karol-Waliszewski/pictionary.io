<template>
  <div id="app">
    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://bulma.io">
          <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28">
        </a>
        
        <a
          role="button"
          class="navbar-burger burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarBasicExample"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-start">
          <router-link to="/" class="navbar-item">Homepage</router-link>
          <router-link to="/rooms" class="navbar-item">Rooms</router-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <button class="button is-primary" @click="createRoom">
              <strong>Create a room</strong>
            </button>
          </div>
        </div>
      </div>
    </nav>
    <router-view/>
  </div>
</template>
<script>
export default {
  name: "App",
  data() {
    return { users: [] };
  },
  methods: {
    leaveRoom() {
      this.$socket.emit("leave_room");
    },
    createRoom() {
      this.$socket.emit("create_room", {
        name: "Testowy pokoj",
        isPrivate: true,
        password: "password",
        maxUsers: 5
      });
    },
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
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
}

.router-link-exact-active {
  color: #42b983;
}
</style>