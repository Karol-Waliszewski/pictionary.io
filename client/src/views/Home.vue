<template>
  <div id="app">
    <img alt="Vue logo" src="@/assets/logo.png" @click="sayHello">
    <HelloWorld :msg="test"/>
  </div>
</template>

<script>
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "app",
  data: () => {
    return {
      test: "Vue Sandbox"
    };
  },
  components: {
    HelloWorld
  },
  methods: {
    sayHello() {
      this.$socket.emit("hello", "Hello World");
    }
  },
  sockets: {
    hello(data) {
      this.test = data;
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
