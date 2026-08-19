<script lang="ts" setup>
import { computed } from 'vue'
import { useHead } from 'nuxt/app'
import HeroCarousel from '@/components/pages/index/HeroCarousel.vue'
import ArticleList from '@/components/common/article/ArticleList.vue'
import DestinationMap from '@/components/pages/index/DestinationMap.vue'
import SiteAside from '@/components/layouts/SiteAside.vue'
import { useArticles } from '@/composables/pages/useArticles'
import { useAssetUrl } from '@/composables/common/useAssetUrl'

const { absoluteUrl } = useAssetUrl()
const { articles, allDestinations } = await useArticles()

// legacy 首頁輪播固定放前三篇
const heroArticles = computed(() => articles.value.slice(0, 3))

useHead({
  title: '週遊記 | Veekend',
  meta: [
    { name: 'description', content: '與你分享我的每週小探險' },
    { property: 'og:title', content: '週遊記 | Veekend' },
    { property: 'og:description', content: '與你分享我的每週小探險' },
    // 社群平台不吃相對路徑，一定要絕對網址才會有預覽圖
    { property: 'og:image', content: absoluteUrl('images/1200x630.jpg') },
    { property: 'og:url', content: absoluteUrl('') },
    { property: 'og:type', content: 'website' },
  ],
})
</script>

<template>
  <div class="home">
    <!-- 首頁沒有視覺上的主標題，但結構上需要一個 h1 給搜尋引擎與螢幕閱讀器 -->
    <h1 class="sr-only">週遊記 Veekend — 每週探索一個地區的旅行紀錄</h1>

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
