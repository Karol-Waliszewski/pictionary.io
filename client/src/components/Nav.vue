<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item" href="https://bulma.io">
        <img src="@/assets/brush.svg" width="38" height="32">
      </router-link>

      <a
        role="button"
        class="navbar-burger burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
        @click="toggleNav"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu" :class="{'is-active':active}">
      <div class="navbar-start">
        <router-link to="/" class="navbar-item">Homepage</router-link>
        <router-link to="/rooms" class="navbar-item">Rooms</router-link>
      </div>

      <div class="navbar-end">
        <div class="navbar-item" v-if="!inRoom">
          <button class="button is-primary" @click="openCreator">
            <strong>Create a room</strong>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Nav",
  data() {
    return { inRoom: false,active:false };
  },
  methods: {
    openCreator() {
      this.$emit("openCreator");
    },
    toggleNav(){
      this.active = !this.active;
    }
  },
  watch: {
    $route: function(to, from) {
      this.inRoom = (to.name == 'room') ? true : false;
    }
  }
};
</script>
<style lang="scss">
.router-link-exact-active,
.navbar-item:hover {
  color: #42b983 !important;
  background-color: #fafafa;
}
.navbar-brand {
  background-color: #fafafa;
}
</style>