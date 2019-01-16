<template>
  <div class="about">
    <h1>This is a room Page</h1>
    <button @click="createRoom">Create Room</button>
    <ul>
      <li v-for="room in rooms" :key="room.id">{{room.id}}: <router-link :to="'./room/'+room.id">{{room.name}}</router-link></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "About",
  data(){return {rooms:[]}},
  methods: {
    createRoom() {
      this.$socket.emit("create_room", {
        name: "Testowy pokoj",
        isPrivate: true,
        password: "test",
        maxUsers: 5
      });

      this.getRooms();
    },
    getRooms(){
      this.$socket.emit("get_rooms");
    }
  },
  sockets: {
    receive_rooms(rooms) {
      this.$data.rooms = rooms;
      console.log(rooms);
    }
  },
  mounted(){
    this.getRooms();
  }
};
</script>