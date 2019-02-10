<template>
  <div class="container">
    <!-- <h1>This is a room Page</h1> -->
    <table class="table is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Users</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="room in rooms" :key="room.id">
          <td>{{room.name}}</td>
          <td>{{room.isPrivate ? 'Private' : 'Public'}}</td>
          <td>{{room.users.length}}/{{room.maxUsers}}</td>
          <td class="is-paddingless">
            <router-link :to="'./room/'+room.id" class="button is-light is-fullwidth">join</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "About",
  data() {
    return { rooms: [] };
  },
  methods: {
    getRooms() {
      this.$socket.emit("get_rooms");
    },
  },
  sockets: {
    receive_rooms(rooms) {
      this.$data.rooms = rooms;
      console.log(rooms);
    }
  },
  mounted() {
    this.getRooms();
    console.log(this.$socket)
  }
};
</script>