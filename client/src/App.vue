<template>
  <div id="app" class="app">
    <navigation @openCreator="openCreator" />
    <div class="main">
      <router-view @openCreator="openCreator" />
    </div>
    <room-creator :isVisible="isModalVisible" @closeCreator="closeCreator" />
    <foot />
  </div>
</template>
<script>
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import RoomCreator from "./components/RoomCreator.vue";

export default {
  name: "App",
  data() {
    return { isModalVisible: false };
  },
  components: {
    navigation: Nav,
    foot: Footer,
    "room-creator": RoomCreator,
  },
  methods: {
    leaveRoom() {
      this.$socket.emit("leave_room");
    },
    openCreator() {
      this.isModalVisible = true;
    },
    closeCreator() {
      this.isModalVisible = false;
    },
  },
  sockets: {
    room_created(id) {
      this.$router.push({ name: "room", params: { id: id } });
    },
  },
  watch: {
    async $route(_, from) {
      if (from.name == "room") {
        this.leaveRoom();
      }
    },
  },
};
</script>

<style lang="scss">
@import "./styles/variables.scss";
.app {
  margin: 0;
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.subtitle {
  a {
    color: $link;
  }
}

.main {
  flex: 1;
  padding-bottom: 2rem;
}

.section-xs {
  @media screen and (max-width: 670px) {
    padding: 1.5rem;
  }
}
</style>
