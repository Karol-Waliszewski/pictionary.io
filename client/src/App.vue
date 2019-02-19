<template>
  <div id="app">
    <navigation @openCreator="openCreator"/>
    <router-view/>
    <room-creator :isVisible="isModalVisible" @closeCreator="closeCreator"></room-creator>
  </div>
</template>
<script>
import Nav from "./components/Nav";
import RoomCreator from "./components/RoomCreator.vue";

export default {
  name: "App",
  data() {
    return { users: [], isModalVisible: false, name: null };
  },
  components: {
    navigation: Nav,
    "room-creator": RoomCreator
  },
  methods: {
    leaveRoom() {
      this.$socket.emit("leave_room");
    },
    openCreator() {
      this.$data.isModalVisible = true;
    },
    closeCreator() {
      this.$data.isModalVisible = false;
    }
  },
  sockets: {
    room_created(id) {
      this.$router.push({ name: "room", params: { id: id } });
    }
  },
  watch: {
    async $route(to, from) {
      if (from.name == "room") {
        this.leaveRoom();
      }
    }
  }
};
</script>
<style lang="scss">
#app {
  margin: 0;
}

a {
  color: #00d1b2 !important;
}

.section-xs {
  @media screen and (max-width: 670px) {
    padding: 3rem 1.5rem;
  }
}
</style>