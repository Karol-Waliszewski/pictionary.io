<template>
  <div id="app">
    <section class="hero is-light is-fullheight">
      <div class="hero-body">
        <div class="container has-text-centered">
          <div class="column is-4 is-offset-4">
            <h3 class="title has-text-grey">Hello!</h3>
            <p class="subtitle has-text-grey">Choose your name to begin the game.</p>
            <div class="box">
              <form>
                <div class="field">
                  <div class="control">
                    <input
                      class="input is-large"
                      type="text"
                      placeholder="Choose your name..."
                      autofocus
                      v-model="name"
                    >
                  </div>
                </div>
                <button
                  class="button is-block is-info is-fullwidth"
                  :disabled="name.length <= 0"
                  @click="chooseName"
                >Start!</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "homepage",
  data: () => {
    return {
      name: ""
    };
  },
  methods: {
    chooseName(e) {
      e.preventDefault();
      this.$socket.emit("setName", this.name);
      this.$socket.name = this.name;
    }
  },

};
</script>

<style lang="scss" scoped>
</style>
