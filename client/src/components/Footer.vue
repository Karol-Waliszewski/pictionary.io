<template>
  <footer class="footer">
    <div class="container">
      <div class="content">
        <p>
          Created by
          <a href="https://github.com/Karol-Waliszewski">Karol Waliszewski</a> 👨‍💻
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "footer"
};
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
