<template>
    <button class="button" @click="auth" :disabled="$auth.isLoading">{{ buttonContent }}</button>
</template>

<script>
export default {
    name: 'AuthButton',
    props: {
        type: String
    },
    methods: {
        logout() {
            this.$auth.logout()
            // console.log(this.$route.path)
            if (this.$route.path !== '/') this.$router.push({ path: '/' })
        },
        auth() {
            if (this.$auth.isLoading) return
            if (this.$auth.isAuthenticated) return this.logout()

            this.$auth.loginWithRedirect({
                screen_hint: this.type === 'login' ? 'login' : 'signup'
            })
        }
    },
    computed: {
        buttonContent() {
            if (this.$auth.isLoading) return 'Loading...'
            else return this.$auth.isAuthenticated ? 'Log out' : this.type === 'login' ? 'Log in' : 'Sign up'
        }
    }
}
</script>