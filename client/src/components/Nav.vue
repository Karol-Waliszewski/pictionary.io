<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item" href="https://bulma.io">
        <img src="https://image.flaticon.com/icons/svg/129/129817.svg" width="38" height="28">
      </router-link>

      <a
        role="button"
        class="navbar-burger burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
        <router-link to="/" class="navbar-item">Homepage</router-link>
        <router-link to="/rooms" class="navbar-item">Rooms</router-link>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <button class="button is-primary" @click="createRoom">
            <strong>Create a room</strong>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Nav",
  methods: {
    async createRoom() {
      const { value: formValues } = await this.$swal({
        title: "Multiple inputs",
        html:
          '<form id="swal-form">' +
          '<input id="name" name="name" class="swal2-input">' +
          '<input id="password" name="password" class="swal2-input">' +
          '<input type="number" id="maxUsers" name="maxUsers" class="swal2-input">' +
          `<label class="checkbox"><input type="checkbox" id="isPrivate" name="isPrivate" value="true">isPrivate</label>` +
          "</form>",
        focusConfirm: false,
        preConfirm: () => {
          return Object.values(document.getElementById("swal-form")).reduce(
            (obj, field) => {
              obj[field.name] = field.value;
              return obj;
            },
            {}
          );
        }
      });
console.log(formValues);
      formValues.isPrivate = (formValues.isPrivate == "on") ? true : false;

      console.log(formValues);

      this.$socket.emit("create_room", formValues);
    }
  }
};
</script>
<style lang="scss">
.router-link-exact-active,
.navbar-item:hover {
  color: #42b983 !important;
  background-color: #fafafa;
}
.navbar-brand {
  background-color: #fafafa;
}
</style>