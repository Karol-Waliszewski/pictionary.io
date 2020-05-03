<template>
  <card-modal
    :visible="isVisible"
    title="Create a room"
    transition="fade"
    @cancel="close"
    @ok="createRoom"
    class="section-xs"
  >
    <form class="columns is-multiline">
      <div class="field column is-12">
        <label class="label">Room name</label>
        <div class="control">
          <input
            class="input"
            type="text"
            placeholder="Enter the name.."
            v-model="name"
            required
          />
        </div>
        <p class="help is-danger" v-if="errors['name']">
          You have to enter the name.
        </p>
      </div>

      <div class="field column is-6">
        <label class="label">Password</label>
        <div class="control">
          <input
            class="input"
            type="text"
            placeholder="Text input"
            v-model="password"
            :disabled="!isPrivate"
          />
        </div>
        <p class="help is-danger" v-if="errors['password']">
          Minimum password length is 3
        </p>
      </div>

      <div class="field column is-6">
        <label class="label">Max Players</label>
        <div class="control">
          <input
            class="input"
            type="number"
            placeholder="Text input"
            v-model="maxUsers"
            min="2"
            required
          />
        </div>
        <p class="help is-danger" v-if="errors['users']">
          Minimum users quantity is 2
        </p>
      </div>

      <div class="column is-6">
        <label class="label">Round time</label>
        <div class="field has-addons">
          <div class="control is-fullwidth">
            <input
              class="input"
              type="number"
              placeholder="Text input"
              v-model="roundTime"
              min="30"
              required
            />
          </div>
          <p class="control">
            <a class="button is-static">
              s
            </a>
          </p>
        </div>
        <p class="help is-danger" v-if="errors['round']">
          Minimum time for a round is 30 seconds.
        </p>
      </div>

      <div class="column is-6">
        <label class="label">Word choosing time</label>
        <div class="field has-addons">
          <div class="control is-fullwidth">
            <input
              class="input"
              type="number"
              placeholder="Text input"
              v-model="wordTime"
              min="10"
              required
            />
          </div>
          <p class="control">
            <a class="button is-static">
              s
            </a>
          </p>
        </div>
        <p class="help is-danger" v-if="errors['word']">
          Minimum time for choosing a word is 10 seconds.
        </p>
      </div>

      <div class="field column is-12">
        <div class="control">
          <switches
            v-model="isPrivate"
            text-enabled="The room is private"
            text-disabled="The room is public"
            theme="bulma"
            color="default"
          ></switches>
        </div>
      </div>
    </form>
  </card-modal>
</template>

<script>
import Switches from "vue-switches";
import { CardModal } from "vue-bulma-modal";

export default {
  name: "roomCreator",
  data() {
    return {
      name: "",
      password: "",
      maxUsers: 5,
      roundTime: 120,
      wordTime: 25,
      isPrivate: false,
      errors: {},
    };
  },
  components: {
    Switches,
    CardModal,
  },
  props: ["isVisible"],
  methods: {
    createRoom() {
      let { errors, ...roomdata } = this.$data;
      let flag = true;

      if (roomdata.name.length < 1) {
        // this.$data.errors.name = true;
        this.$set(this.$data.errors, "name", true);
        flag = false;
      } else {
        this.$set(this.$data.errors, "name", false);
      }

      if (roomdata.isPrivate) {
        if (roomdata.password.length < 3) {
          //this.$data.errors.password = true;
          this.$set(this.$data.errors, "password", true);
          flag = false;
        } else {
          this.$set(this.$data.errors, "password", false);
        }
      }

      if (roomdata.maxUsers < 2) {
        this.$set(this.$data.errors, "users", true);
        flag = false;
      } else {
        this.$set(this.$data.errors, "users", false);
      }

      if (roomdata.roundTime < 30) {
        this.$set(this.$data.errors, "round", true);
        flag = false;
      } else {
        this.$set(this.$data.errors, "round", false);
      }

      if (roomdata.wordTime < 10) {
        this.$set(this.$data.errors, "word", true);
        flag = false;
      } else {
        this.$set(this.$data.errors, "word", false);
      }

      if (!flag) {
        return false;
      }

      this.$socket.emit("create_room", roomdata);
      this.$emit("closeCreator");

      this.resetForm();

      return true;
    },
    close() {
      this.$emit("closeCreator");
    },
    resetForm() {
      this.$data.name = "";
      this.$data.password = "";
      this.$data.maxUsers = 5;
      this.$data.isPrivate = false;
      this.$data.errors = {};
    },
  },
};
</script>

<style lang="scss">
.control.is-fullwidth {
  flex: 1;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
  transform: rotateY(50deg);
}
.fade-enter-active,
.fade-leave {
  opacity: 1;
  transform: rotateY(0deg);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity, transform 200ms ease-out;
}
</style>
