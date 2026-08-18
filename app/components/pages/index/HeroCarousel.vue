<script lang="ts" setup>
import { ref } from 'vue'
import BaseCarousel from '@/components/common/carousel/BaseCarousel.vue'
import { useAssetUrl } from '@/composables/common/useAssetUrl'
import type { Article } from '@/types/api/article'

// legacy 首頁的 Swiper。原本是三張硬編碼的 slide，改成吃資料。
// Swiper 的 parallax 效果改用 CSS transition 近似（見 .is-active 的樣式）。
defineProps<{
  articles: Article[]
}>()

const assetUrl = useAssetUrl()
const slide = ref(0)
</script>

<template>
  <section class="hero">
    <BaseCarousel v-model="slide" height="450px" :interval="3500" :show-arrows="false">
      <VCarouselItem v-for="(article, articleIndex) in articles" :key="article.week">
        <NuxtLink :to="`/article/${article.week}`" class="hero__slide">
          <div class="hero__photo">
            <img :src="assetUrl(article.largeCoverUrl)" :alt="`${article.city}${article.district}`" >
          </div>
          <div class="hero__caption" :class="{ 'is-active': slide === articleIndex }">
            <div class="hero__week">
              <p>week</p>
              <strong>{{ String(article.week).padStart(2, '0') }}</strong>
            </div>
            <div class="hero__text">
              <p>{{ article.city }} {{ article.district }}</p>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <h2 v-html="article.title" />
            </div>
          </div>
        </NuxtLink>
      </VCarouselItem>
    </BaseCarousel>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  padding: 30px 0;

  @include mobile {
    padding: 16px 0;
  }

  &__slide {
    position: relative;
    display: block;
    height: 100%;
    color: var(--secondary);
  }

  &__photo {
    padding: 0 30px;

    @include mobile {
      padding: 0 15px;
    }

    img {
      width: 100%;
      height: 450px;
      object-fit: cover;
      border-radius: var(--border-radius-m);
    }
  }

  // 壓在照片右下角的黑＋黃雙色標題塊
  &__caption {
    position: absolute;
    top: 280px;
    right: 0;
    z-index: 11;
    display: flex;
    width: 500px;
    height: 120px;
    text-align: center;

    @media screen and (max-width: 1200px) {
      right: 30px;
    }

    @include mobile {
      top: 0;
      left: 15px;
      width: calc(100% - 30px);
    }

    @include min-mobile {
      height: 80px;
    }
  }

  &__week {
    width: 25%;
    padding-top: 20px;
    color: #ffffff;
    background-color: var(--secondary);

    @include mobile {
      border-radius: var(--border-radius-m) 0 0 0;
    }

    @include min-mobile {
      padding-top: 12px;
    }

    p {
      @include body1-regular;
    }

    strong {
      @include display;
      display: block;
      margin-top: -20px;
      font-size: 60px;

      @include min-mobile {
        margin-top: -9px;
        font-size: 30px;
      }
    }
  }

  &__text {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    width: 75%;
    padding: 0 20px;
    background-color: var(--primary);
    border-radius: 0 var(--border-radius-s) var(--border-radius-s) 0;

    @media (max-width: 1200px) {
      border-radius: 0;
    }

    @include mobile {
      justify-content: flex-start;
      text-align: left;
      border-radius: 0 var(--border-radius-m) 0 0;
    }

    @include min-mobile {
      padding: 0 10px;
    }

    p {
      @include subtitle1-regular;
      position: relative;

      @include min-mobile {
        margin-bottom: 4px;
        font-size: 0.6rem;
      }
    }

    // 地區名底下的白色橫槓
    p::after {
      content: '';
      position: absolute;
      top: 16px;
      left: 50%;
      z-index: -1;
      width: 110%;
      border-bottom: 10px solid #ffffff;
      transform: translateX(-50%);
      transition: var(--transition-fast);

      @include min-mobile {
        top: 6px;
        border-bottom: 8px solid #ffffff;
      }
    }

    h2 {
      @include head2-medium;
      width: 100%;
      line-height: 1.2;

      @include min-mobile {
        font-size: 1rem;
      }
    }
  }

  // 近似 Swiper 的 parallax：切到這張時標題塊滑入
  &__caption {
    opacity: 0;
    transform: translateX(24px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  }

  &__caption.is-active {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
