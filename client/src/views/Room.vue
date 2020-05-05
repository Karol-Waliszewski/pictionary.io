<template>
  <div class="section-xs container">
    <div class="columns is-multiline">
      <div class="column is-full">
        <h1 class="title is-2 has-text-centered" v-if="room">
          {{ room.name.toUpperCase() }}
        </h1>
        <h2 v-if="room" class="subtitle is-4 has-text-centered">
          {{ parseInt(time / 60) }}:{{
            time % 60 <= 9 ? "0" + (time % 60) : time % 60
          }}
        </h2>
      </div>

      <div class="column is-3">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">Players: {{ users.length }}</p>
          </header>
          <div class="card-content">
            <ul class="content playerlist" v-if="showUsers">
              <li
                v-for="user in sortedUsers"
                :key="user.id"
                v-if="painter == user.id"
              >
                <strong>{{ user.name }} ✏️</strong> :
                <span class="has-text-weight-bold">{{ user.points }}</span>
              </li>
              <li :key="user.id" v-else>
                {{ user.name }} :
                <span class="has-text-weight-bold">{{ user.points }}</span>
              </li>
            </ul>
          </div>
          <footer class="card-footer">
            <router-link
              to="/rooms"
              class="card-footer-item has-text-danger is-hoverable"
              >Leave Room</router-link
            >
          </footer>
        </div>

        <div
          class="card card--painter"
          v-if="iDraw && !roundStarted && words.length > 0"
        >
          <header class="card-header">
            <div class="card-header-title">
              <p>Choose next word</p> 
              <span>{{ wordTime }}s</span>
            </div>
          </header>
          <div class="card-content">
            <ul class="content">
              <li v-for="word in words" :key="word">
                <button
                  class="button is-fullwidth is-word"
                  @click="
                    () => {
                      chooseWord(word);
                    }
                  "
                >
                  {{ word }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="card card--painter" v-if="iDraw && roundStarted">
          <header class="card-header">
            <div class="card-header-title">
              <p>Your secret word</p>
            </div>
          </header>
          <div class="card-content">
            <p class="content">{{ password }}</p>
          </div>
        </div>
      </div>

      <whiteboard :iDraw="iDraw" :started="roundStarted"/>

      <div class="column is-3" id="chat">
        <div class="card chat">
          <header class="card-header">
            <p class="card-header-title">Chat</p>
          </header>
          <div class="chat-body" ref="chat">
            <ul class="chat-messages">
              <li
                v-for="message in messages"
                :key="message.id"
                class="chat-message"
              >
                <span
                  class="has-text-weight-bold"
                  v-if="message.sender != 'server'"
                  >{{ message.sender }}:</span
                >
                <span v-if="message.sender == 'server'">
                  <strong>{{ message.msg }}</strong>
                </span>
                <span v-else>{{ " " + message.msg }}</span>
              </li>
            </ul>
          </div>
          <footer class="card-footer">
            <form class="field has-addons chat-input" @submit="sendMessage">
              <div class="control">
                <input
                  v-model="message"
                  class="input is-borderless"
                  type="text"
                  placeholder="Send a message..."
                />
              </div>
              <div class="control">
                <input
                  type="submit"
                  class="button is-primary is-borderless"
                  value="Send"
                />
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
    return {
      users: [],
      showUsers: false,
      room: null,
      message: "",
      messages: [],
      painter: null,
      words: [],
      iDraw: false,
      password: null,
      roundStarted: false,
      time: 0,
      wordTime: 0,
    };
  },
  components: { Whiteboard },
  methods: {
    async joinRoom() {
      // Getting Password
      let password = "";

      if (!this.room.users.includes(this.$socket.id) && this.room.isPrivate) {
        password = await this.getPassword();
      }

      // Getting Name
      let name = await this.getName();
      this.$socket.emit("setName", name);
      this.$socket.name = name;
      this.showUsers = true;

      // Joining
      this.$socket.emit("join_room", {
        id: this.$route.params.id,
        password,
      });
    },
    getUsers() {
      this.$socket.emit("get_users");
    },
    getRoomInfo() {
      this.$socket.emit("get_room", this.$route.params.id);
    },
    async getName() {
      const name = await this.$swal({
        title: "Enter your name",
        input: "text",
        showCancelButton: false,
        inputPlaceholder: "Your name is...",
        inputAttributes: {
          autocapitalize: "off",
          autocorrect: "off",
        },
      });

      return name.value;
    },
    async getPassword() {
      const { value: password } = await this.$swal({
        title: "Enter your password",
        input: "password",
        showCancelButton: true,
        inputPlaceholder: "Enter your password",
        inputAttributes: {
          autocapitalize: "off",
          autocorrect: "off",
        },
      });

      return password;
    },
    sendMessage(e) {
      e.preventDefault();
      if (this.message.length != 0) {
        this.$socket.emit("send_message", this.message);
        this.message = "";
      }
    },
    chooseWord(word) {
      this.$socket.emit("word_chosen", word);
    },
    setPainter(painter) {
      this.painter = painter;
      this.iDraw = painter == this.$socket.id;
    },
    scrollChat() {
      this.$nextTick(() => {
        this.$refs.chat.scrollTo(0, this.$refs.chat.scrollHeight);
      });
    },
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
      if (room) {
        this.room = room;
        this.setPainter(room.painter);
        this.getUsers();
        this.joinRoom();
      } else {
        this.$swal({ title: "This room does not exist", type: "error" });
        this.$router.push("/rooms");
      }
    },
    receive_message(msgObj) {
      if (msgObj && msgObj.msg && msgObj.msg.length) {
        this.messages.push(msgObj);
        this.scrollChat();
      }
    },
    receive_server_message(msg) {
      if (msg && msg.length) {
        this.messages.push({ sender: "server", msg });
        this.scrollChat();
      }
    },
    receive_callback(msg) {
      if (msg && msg.length) {
        this.messages.push({ sender: "server", msg });
        this.scrollChat();
      }
    },
    receive_password(password) {
      this.password = password;
    },
    round_initialized(words) {
      this.words = words;
    },
    round_started() {
      this.roundStarted = true;
      this.words = [];
    },
    round_stopped() {
      this.roundStarted = false;
    },
    painter_changed(painter) {
      this.setPainter(painter);
    },
    countdown(time) {
      this.time = time;
    },
    countdown_painter(time) {
      this.wordTime = time;
    },
  },
  computed: {
    sortedUsers() {
      return this.users.sort((a, b) => {
        return b.points - a.points;
      });
    },
  },
  mounted() {
    this.getRoomInfo();
  },
  watch: {
    "$route.params.id": function(id) {
      this.messages = [];
      this.getRoomInfo();
    },
  },
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
  @media screen and (max-width: 670px) {
    height: 200px;
  }
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

.chat-input {
  display: flex;
  justify-content: stretch;
  width: 100%;
  .control:first-child {
    flex: 1;
  }
}

.card--painter {
  margin-top: 2rem;
  .card-header-title {
    justify-content: space-between;
  }
}

.is-word {
  white-space: normal;
  height: auto;
}
</style>
