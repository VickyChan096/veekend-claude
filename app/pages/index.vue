<script lang="ts" setup>
import { computed } from 'vue'
import { useHead } from 'nuxt/app'
import HeroCarousel from '@/components/pages/index/HeroCarousel.vue'
import ArticleList from '@/components/pages/index/ArticleList.vue'
import DestinationMap from '@/components/pages/index/DestinationMap.vue'
import SiteAside from '@/components/layouts/SiteAside.vue'
import { useArticles } from '@/composables/pages/useArticles'

const { articles, allDestinations } = await useArticles()

// legacy 首頁輪播固定放前三篇
const heroArticles = computed(() => articles.value.slice(0, 3))

useHead({
  title: '週遊記 | Veekend',
  meta: [
    { name: 'description', content: '與你分享我的每週小探險' },
    { property: 'og:title', content: '週遊記 | Veekend' },
    { property: 'og:description', content: '與你分享我的每週小探險' },
  ],
})
</script>

<template>
  <div class="home">
    <div class="home__hero">
      <HeroCarousel :articles="heroArticles" />
    </div>

    <div class="home__content">
      <div class="home__main">
        <ArticleList :articles="articles" />

        <ClientOnly>
          <DestinationMap :destinations="allDestinations" />
          <template #fallback>
            <div class="home__map-fallback">地圖載入中…</div>
          </template>
        </ClientOnly>
      </div>

      <SiteAside />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  &__hero,
  &__content {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__content {
    display: flex;
    justify-content: space-between;
    padding: 0 30px 30px;

    @include mobile {
      flex-wrap: wrap;
      padding: 0 15px 30px;
    }
  }

  &__main {
    width: 78%;

    @include pad {
      width: 71%;
    }

    @include mobile {
      width: 100%;
    }
  }

  &__map-fallback {
    @include body2-regular;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 450px;
    color: var(--subtitle);
    background-color: var(--container);
    border-radius: var(--border-radius-s);
  }
}
</style>
