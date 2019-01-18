<template>
  <div class="container">
    <div class="columns is-multiline is-mobile">
      <div class="column is-full">
        <h1 class="title is-2">This is a room number: {{$route.params.id}}</h1>
        <h2 v-if="room" class="subtitle is-4">{{room.name}}</h2>
      </div>

      <div class="column is-3">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">Players</p>
          </header>
          <div class="card-content">
            <ul class="content playerlist">
              <li v-for="user in users" :key="user">
                {{user}} :
                <span class="has-text-weight-bold">5</span>
              </li>
            </ul>
          </div>
          <footer class="card-footer">
            <router-link to="/rooms" class="card-footer-item has-text-danger">Leave Room</router-link>
          </footer>
        </div>
      </div>

      <div class="column is-6">
        <div class="card whiteboard-wrapper">
          <canvas class="whiteboard" id="whiteboard"></canvas>
          <footer class="card-footer whiteboard-footer">njgrngijn</footer>
        </div>
      </div>

      <div class="column is-3" id="chat">
        <div class="card chat">
          <header class="card-header">
            <p class="card-header-title">Chat</p>
          </header>
          <div class="chat-body">
            <ul class="chat-messages">
              <li v-for="message in messages" :key="message.id" class="chat-message">
                <span class="has-text-weight-bold">{{message.sender}}:</span>
                <span>{{message.msg}}</span>
              </li>
            </ul>
          </div>
          <footer class="card-footer">
            <form class="field has-addons" @submit="sendMessage">
              <div class="control">
                <input
                  v-model="message"
                  class="input is-borderless"
                  type="text"
                  placeholder="Send a message..."
                >
              </div>
              <div class="control">
                <input type="submit" class="button is-info is-borderless" value="Send">
              </div>
            </form>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "About",
  data() {
    return { users: [], room: null, message: "", messages: [] };
  },
  methods: {
    joinRoom() {
      let password = this.room.isPrivate ? this.getPassword() : "";

      this.$socket.emit("join_room", {
        id: this.$route.params.id,
        password
      });
    },
    // leaveRoom() {
    //   this.$socket.emit("leave_room");
    //   this.$router.push("/rooms");
    // },
    getUsers() {
      this.$socket.emit("get_users");
    },
    getRoomInfo() {
      this.$socket.emit("get_room", this.$route.params.id);
    },
    getPassword() {
      // TODO password prompt
      return "password";
    },
    sendMessage() {
      if (this.$data.message.length != 0) {
        this.$socket.emit("send_message", this.$data.message);
        this.$data.message = "";
      }
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
      this.getUsers();
      this.joinRoom();
    },
    receive_message(msgObj) {
      this.$data.messages.push(msgObj);
    }
  },
  mounted() {
    this.getRoomInfo();
  },
  watch: {
    $route(to, from) {
      this.getRoomInfo();
    }
  }
};
</script>

<style lang="scss" scoped>
.is-borderless {
  border-radius: 0;
  border: 0;
  box-shadow: 0;
}

.playerlist {
  text-align: left;
}

.chat-body {
  height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-messages {
  list-style-type: none;
}

.chat-message {
  text-align: left;
  padding: 0.5rem 1rem;
  box-shadow: 0 1px 2px rgba(10, 10, 10, 0.1);
  word-break: break-all;
}

.whiteboard-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.whiteboard {
  width: 100%;
  height: 100%;
  background: palegoldenrod;
}

.whiteboard-footer {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
</style>
