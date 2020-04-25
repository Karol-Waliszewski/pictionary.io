import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import VueSweetAlert from "vue-sweetalert2";
import router from "./router.js";
import App from "./App.vue";
import "./registerServiceWorker";

// Bulma
import "bulma/css/bulma.css";

Vue.config.productionTip = false;

// Vue + Socket.io
Vue.use(
  new VueSocketIO({
    debug: false,
    //connection: "https://charadesio.herokuapp.com/",
    connection: "http://localhost:5050"
  })
);

// SweetAlert2
Vue.use(VueSweetAlert);

// Initializing
new Vue({
  router,
  render: h => h(App)
}).$mount("#app");