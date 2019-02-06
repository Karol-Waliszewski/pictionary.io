<template>
  <div class="container">
    <div class="columns is-multiline is-mobile">
      <div class="column is-full">
        <h1 class="title is-2 has-text-centered" v-if="room">{{room.name.toUpperCase()}}</h1>
        <h2 v-if="room" class="subtitle is-4 has-text-centered">1:49</h2>
      </div>

      <div class="column is-3">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">Players: {{users.length}}</p>
          </header>
          <div class="card-content">
            <ul class="content playerlist">
              <li v-for="user in users" :key="user.id">
                {{user.name}} :
                <span class="has-text-weight-bold">{{user.points}}</span>
              </li>
            </ul>
          </div>
          <footer class="card-footer">
            <router-link
              to="/rooms"
              class="card-footer-item has-text-danger is-hoverable"
            >Leave Room</router-link>
          </footer>
        </div>
      </div>

      <whiteboard/>

      <div class="column is-3" id="chat">
        <div class="card chat">
          <header class="card-header">
            <p class="card-header-title">Chat</p>
          </header>
          <div class="chat-body">
            <ul class="chat-messages">
              <li v-for="message in messages" :key="message.id" class="chat-message">
                <span
                  class="has-text-weight-bold"
                  v-if="message.sender !='server'"
                >{{message.sender}}:</span>
                <span v-if="message.sender =='server'">
                  <strong>{{message.msg}}</strong>
                </span>
                <span v-else>{{" " + message.msg}}</span>
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
import Whiteboard from "../components/WhiteBoard";

export default {
  name: "About",
  data() {
    return { users: [], room: null, message: "", messages: [] };
  },
  components: { Whiteboard },
  methods: {
    async joinRoom() {
      let password = "";

      if (!this.room.users.includes(this.$socket.id) && this.room.isPrivate) {
        password = await this.getPassword();
      }

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
    async getPassword() {
      const { value: password } = await this.$swal({
        title: "Enter your password",
        input: "password",
        showCancelButton: true,
        inputPlaceholder: "Enter your password",
        inputAttributes: {
          autocapitalize: "off",
          autocorrect: "off"
        }
      });

      return password;
    },
    sendMessage(e) {
      e.preventDefault();
      if (this.message.length != 0) {
        this.$socket.emit("send_message", this.message);
        this.message = "";
      }
    }
  },
  sockets: {
    receive_users(users) {
      this.users = users;
    },
    receive_users_error(msg) {
      this.$swal({ title: msg, type: "error" });
    },
    join_room_error(msg) {
      this.$swal({ title: msg, type: "error" });
      this.$router.push("/rooms");
    },
    receive_room(room) {
      this.room = room;
      this.getUsers();
      this.joinRoom();
    },
    receive_message(msgObj) {
      this.messages.push(msgObj);
    },
    receive_server_message(msg) {
      this.messages.push({ sender: "server", msg });
    },
    receive_callback(msg){
      this.messages.push({ sender: "server", msg });
    },
    round_initialized(words){
      console.log(words);
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
</style>
