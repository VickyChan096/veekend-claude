<script lang="ts" setup>
import { useAssetUrl } from '@/composables/common/useAssetUrl'
import type { Article } from '@/types/api/article'

// legacy 的 .heroSection：壓暗的大圖 + 置中的週次與地區
defineProps<{
  article: Article
}>()

const { assetUrl } = useAssetUrl()
</script>

<template>
  <section class="article-hero">
    <div class="article-hero__content">
      <p>Week {{ article.week }} | {{ article.visitedDate }}</p>
      <h2>{{ article.city }} {{ article.district }}</h2>
    </div>
    <img
      :src="assetUrl(article.largeCoverUrl)"
      :alt="`week ${article.week} ${article.city}${article.district}`"
    >
  </section>
</template>

<style lang="scss" scoped>
.article-hero {
  position: relative;
  width: 100%;
  height: 450px;
  margin-bottom: 20px;
  overflow: hidden;

  &__content {
    position: absolute;
    top: calc(50% - 47px);
    left: calc(50% - 140px);
    z-index: 11;
    width: 280px;
    color: #ffffff;
    text-align: center;

    p {
      @include body1-regular;
    }

    h2 {
      @include head1-medium;
      font-size: 42px;
    }
  }

  img {
    width: 100%;
    min-height: 450px;
    object-fit: cover;
    object-position: 50% 0%;
    filter: brightness(30%);
    animation: hero-banner-move 8s infinite;
  }
}

// legacy 的 heroBannerMove：背景緩慢左右移動
@keyframes hero-banner-move {
  0% {
    object-position: 0% 0%;
  }
  50% {
    object-position: 100% 0%;
  }
  100% {
    object-position: 0% 0%;
  }
}
</style>
