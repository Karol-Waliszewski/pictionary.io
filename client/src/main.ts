import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import { Auth0AppState, Auth0Plugin } from './services/auth/auth0-plugin'
import VueSweetAlert from 'vue-sweetalert2'
import { router } from './router'
import App from './App.vue'
import './registerServiceWorker'
import './styles/index.scss'

Vue.config.productionTip = false

Vue.use(
  new VueSocketIO({
    debug: false,
    // connection: 'https://charadesio.herokuapp.com/'
    connection: process.env.NODE_ENV === 'production' ? 'https://puns-web.herokuapp.com/' : 'http://localhost:3000'
  })
)

Vue.use(Auth0Plugin, {
  domain: process.env.VUE_APP_AUTH0_DOMAIN,
  clientId: process.env.VUE_APP_AUTH0_CLIENT_ID,
  onRedirectCallback: (appState: Auth0AppState) => router.push(appState?.targetUrl ? appState.targetUrl : window.location.pathname)
})

Vue.use(VueSweetAlert, {
  confirmButtonColor: '#e58e26',
  cancelButtonColor: '#f5f5f5'
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
