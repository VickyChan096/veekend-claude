<script lang="ts" setup>
import { useHead } from 'nuxt/app'
import BaseButton from '@/components/common/button/BaseButton.vue'

// TODO(Phase 4): 移植 legacy-app/index.html + js/index.js
// 首頁輪播（Swiper → BaseCarousel）、文章列表（BaseCard）、load more
useHead({ title: 'Veekend' })
</script>

<template>
  <div class="home">
    <h1 class="home__title">Veekend</h1>
    <p class="home__lead">共用元件已建立，首頁重構待 Phase 4。</p>
    <BaseButton to="/example" text="查看元件庫" prepend-icon="mdi:view-grid-outline" />
  </div>
</template>

<style lang="scss" scoped>
.home {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
  background-color: var(--surface);

  &__title {
    @include display;
    font-size: 4rem;
    color: var(--title);
  }

  &__lead {
    @include body1-regular;
    margin: 8px 0 24px;
    color: var(--subtitle);
  }
}
</style>
