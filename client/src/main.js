import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import router from "./router.js";
import App from "./App.vue";
import "./registerServiceWorker";

// Bulma 
import 'bulma/css/bulma.css';

Vue.config.productionTip = false;

// Vue + Socket.io
Vue.use(
  new VueSocketIO({
    debug: true,
    connection: "http://localhost:5050/"
  })
);


// Initializing
new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
