<template>
  <div class="about">
    <h1>This is a room number: {{$route.params.id}}</h1>
    <ul>
      <li v-for="user in users" :key="user">{{user}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "About",
  data() {
    return { users: [] };
  },
  methods: {
    joinRoom() {
      this.$socket.emit("join_room", { id: this.$route.params.id });
    },
    getUsers() {
      this.$socket.emit("get_users");
    }
  },
  sockets: {
    receive_users(users) {
      this.$data.users = users;
    },
    receive_users_error(msg) {
      console.error(msg);
    },
    joined_room() {
      console.log("joined");
      this.getUsers();
    }
  },
  mounted() {
    console.log("FIRED");
    this.joinRoom();
  }
};
</script>