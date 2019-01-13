<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="createRoom">Create Room</button>
  </div>
</template>

<script>
export default {
  name: "About",
  methods: {
    createRoom() {
      this.$socket.emit("create_room", {
        name: "Testowy pokoj",
        isPrivate: true,
        password: "test",
        maxUsers: 5
      });
    }
  }
};
</script>