import Vue from 'vue'
import createAuth0Client from '@auth0/auth0-spa-js'
import { CombinedVueInstance } from 'vue/types/vue'

// https://auth0.com/blog/complete-guide-to-vue-user-authentication/

type Auth0LoginOptions = Partial<{
    screen_hint: 'signup' | 'login'
}>

type Auth0LogoutOptions = Partial<{
    returnTo: string
}>

type Auth0SilentTokenOptions = Partial<any>

export type Auth0AppState = Partial<{ targetUrl: string }>

type Data = {
    auth0Client: any
    isLoading: boolean
    isAuthenticated: boolean
    user: any
    error: any
}

type Auth0Instance = CombinedVueInstance<any, Data, any, any, any>

let instance: Auth0Instance
export const getAuthInstance = (): Auth0Instance => instance

export const useAuth0 = ({
    onRedirectCallback = (appState: Auth0AppState = {}) => window.history.replaceState(appState, document.title, window.location.pathname),
    redirectUri = window.location.origin,
    ...pluginOptions
}) => {
    if (instance) return instance as Auth0Instance
    instance = new Vue({
        data() {
            return {
                auth0Client: null,
                isLoading: true,
                isAuthenticated: false,
                user: {},
                error: null
            } as Data
        },
        methods: {
            async handleRedirectCallback() {
                this.isLoading = true
                try {
                    await this.auth0Client?.handleRedirectCallback()
                    this.user = await this.auth0Client?.getUser()
                    this.isAuthenticated = true
                } catch (error) {
                    this.error = error
                } finally {
                    this.isLoading = false
                }
            },
            loginWithRedirect(options: Auth0LoginOptions) {
                return this.auth0Client.loginWithRedirect(options)
            },
            logout(options: Auth0LogoutOptions) {
                return this.auth0Client.logout(options)
            },
            getTokenSilently(o: Auth0SilentTokenOptions) {
                return this.auth0Client.getTokenSilently(o)
            }
        },

        async created() {
            this.auth0Client = await createAuth0Client({
                ...pluginOptions,
                domain: pluginOptions.domain,
                client_id: pluginOptions.clientId,
                audience: pluginOptions.audience,
                redirect_uri: redirectUri
            })

            try {
                if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
                    const { appState } = await this.auth0Client.handleRedirectCallback()

                    onRedirectCallback(appState)
                }
            } catch (error) {
                this.error = error
            } finally {
                this.isAuthenticated = await this.auth0Client.isAuthenticated()
                this.user = await this.auth0Client.getUser()
                this.isLoading = false
            }
        }
    }) as Auth0Instance

    return instance
}

export const Auth0Plugin = {
    install(Vue: any, options: any) {
        Vue.prototype.$auth = useAuth0(options)
    }
}
