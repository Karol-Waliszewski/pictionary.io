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
      this.$socket.emit("join_room", {
        id: this.$route.params.id,
        password: "test"
      });
    },
    getUsers() {
      this.$socket.emit("get_users");
    }
  },
  sockets: {
    receive_users(users) {
      this.$data.users = users;
      console.log(users);
    },
    receive_users_error(msg) {
      console.error(msg);
    },
    join_room_error(msg) {
      console.error(msg);
    }
  },
  mounted() {
    console.log("FIRED");
    this.joinRoom();
  }
};
</script>