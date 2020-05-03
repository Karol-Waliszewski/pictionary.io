<template>
  <div>
    <section class="section hero">
      <div class="hero-body">
        <div class="container has-text-centered">
          <div class="column is-6 is-offset-3">
            <h2 class="title is-1">Hello 👋</h2>
            <h3 class="subtitle is-2">
              Welcome on <a href="./">pictionary.io</a>!
            </h3>
          </div>
        </div>
      </div>
    </section>

    <section class="section-xs container has-text-centered">
      <div class="hero is-light">
        <div class="hero-body">
          <div class="content">
            <h4 class="title is-3 ">The rules are simple:</h4>
            <p>Every round takes max. 2 minutes</p>
            <p>You need at least 2 players to start the game</p>
            <p>As a painter you have to draw pictures suggesting drawn word</p>
            <p>As a viewer you have to guess the word</p>
            <h5 class="title is-5">Enjoy 😄</h5>
          </div>
        </div>
      </div>

      <button class="button is-primary is-large " @click="openCreator">
        <strong>Create a room</strong>
      </button>
    </section>
  </div>
</template>

<script>
export default {
  name: "homepage",
  methods: {
    openCreator() {
      this.$emit("openCreator");
    },
  },
};
</script>

<style lang="scss" scoped>
.button {
  margin: 2% 0;
}
</style>
