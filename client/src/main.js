import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import SocketIO from "socket.io-client";
import VueSweetAlert from "vue-sweetalert2";
import router from "./router.js";
import App from "./App.vue";
import Colors from "./styles/variables.scss";
import "./registerServiceWorker";

// Bulma
import "./styles/index.scss";

Vue.config.productionTip = false;

// Vue + Socket.io
Vue.use(
  new VueSocketIO({
    debug: false,
    // connection: "https://charadesio.herokuapp.com/",
    connection: SocketIO("http://localhost:3000", {
      secure: false,
      withCredentials: false,
      rejectUnauthorized: false,
      transports: ["websocket"],
    }),
  })
);

// SweetAlert2
Vue.use(VueSweetAlert, {
  confirmButtonColor: Colors.primary,
  cancelButtonColor: Colors.light,
});

// Initializing
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
