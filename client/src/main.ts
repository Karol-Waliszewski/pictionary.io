import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import { Auth0AppState, Auth0Plugin } from './services/auth/auth0-plugin'
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

Vue.use(Auth0Plugin, {
    domain: process.env.VUE_APP_AUTH0_DOMAIN,
    clientId: process.env.VUE_APP_AUTH0_CLIENT_ID,
    onRedirectCallback: (appState: Auth0AppState) => router.push(appState?.targetUrl ? appState.targetUrl : window.location.pathname)
})

Vue.use(VueSweetAlert, {
    confirmButtonColor: Colors.primary,
    cancelButtonColor: Colors.light
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
