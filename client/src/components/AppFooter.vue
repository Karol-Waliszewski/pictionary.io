<template>
    <footer class="footer">
        <div class="container">
            <div class="content">
                <p>
                    Created by
                    <a href="https://github.com/Karol-Waliszewski" target="_blank">Karol Waliszewski</a> 👨‍💻 and <a href="#">Jakub Tkaczyk</a> 👨‍💻
                </p>
            </div>
        </div>
    </footer>
</template>

<script lang="ts">
export default {
    name: 'AppFooter'
}
</script>

<style lang="scss" scoped>
.footer {
    width: 100%;
    padding-bottom: 3rem;
    text-align: right;
    @media screen and (max-width: 500px) {
        text-align: center;
    }
}
</style>
