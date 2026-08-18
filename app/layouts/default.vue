<script lang="ts" setup>
import HeaderBar from '@/components/layouts/HeaderBar.vue'
import FooterBar from '@/components/layouts/FooterBar.vue'
import ScrollToTopButton from '@/components/layouts/ScrollToTopButton.vue'
</script>

<template>
  <div class="site">
    <HeaderBar />
    <main class="site__main">
      <slot />
    </main>
    <FooterBar />
    <ScrollToTopButton />
  </div>
</template>

<style lang="scss" scoped>
.site__main {
  // 補上 fixed header 的高度
  padding-top: 56px;
  background-color: var(--surface);
}
</style>
