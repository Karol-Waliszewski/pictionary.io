import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import VueSweetAlert from 'vue-sweetalert2'
import { router } from './router'
import App from './App.vue'
import Colors from './styles/variables.scss'
import './registerServiceWorker'
import './styles/index.scss'

Vue.config.productionTip = false

Vue.use(
    new VueSocketIO({
        debug: false,
        connection: 'https://charadesio.herokuapp.com/'
        //connection: "http://localhost:5050",
    })
)

Vue.use(VueSweetAlert, {
    confirmButtonColor: Colors.primary,
    cancelButtonColor: Colors.light
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
