<template>
  <div class="about">
    <h1>This is a room number: {{$route.params.id}}</h1>
    <h2 v-if="room">{{room.name}}</h2>
    <ul>
      <li v-for="user in users" :key="user">{{user}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "About",
  data() {
    return { users: [], room: null };
  },
  methods: {
    joinRoom() {
      let password = this.room.isPrivate ? this.getPassword() : "";

      this.$socket.emit("join_room", {
        id: this.$route.params.id,
        password
      });
    },
    getUsers() {
      this.$socket.emit("get_users");
    },
    getRoomInfo() {
      this.$socket.emit("get_room", this.$route.params.id);
    },
    getPassword() {
      // TODO password prompt
      return "password";
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
    },
    receive_room(room) {
      this.$data.room = room;
      console.log(room);
      this.joinRoom();
    }
  },
  mounted() {
    this.getRoomInfo();
  }
};
</script>