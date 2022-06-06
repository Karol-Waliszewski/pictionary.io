<template>
    <section class="section hero">
        <div class="hero-body">
            <div class="has-text-centered">
                <h1 v-if="$auth.isLoading">Loading profile...</h1>
                <div v-else>
                    <div class="picture">
                        <img :src="$auth.user.picture" width="120" height="120" alt="User's profile picture" />
                    </div>
                    <div>
                        <h1 class="title">{{ $auth.user.nickname }}</h1>
                        <p class="lead text-muted">{{ $auth.user.email }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'Profile'
}
</script>

<style lang="scss" scoped>
@import './../styles/variables.scss';
.picture {
    margin-bottom: 2rem;
    img {
        border-radius: 100%;
        background-color: $primary;
    }
}
</style>