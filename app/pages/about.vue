<script lang="ts" setup>
import { useHead } from 'nuxt/app'
import BaseImage from '@/components/common/image/BaseImage.vue'

// legacy 的 about.html。設計重點是照片後面的兩塊錯位色塊：
// 黑色方塊往左下偏、黃色長條往右上撐出去。

useHead({
  title: '關於 | Veekend',
  meta: [{ name: 'description', content: '關於 VC 與 Veekend 計畫' }],
})
</script>

<template>
  <div class="about">
    <div class="about__content">
      <div class="about__photo">
        <BaseImage src="images/profile.jpg" alt="VC" sizes="sm:320px" />
      </div>
      <div class="about__text">
        <h1>關於 VC</h1>
        <p>
          Hi，我是VC<br >我在2019年末<br >給自己一個生活目標<br >花了一年總共54週<br >每週探索一個地區<br >想與你分享我的小探險
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about {
  max-width: 1200px;
  padding: 150px 114px;
  margin: 0 auto;

  @include mobile {
    padding-top: 100px;
    padding-bottom: 70px;
  }

  @media (max-width: 650px) {
    padding-right: 64px;
    padding-left: 64px;
  }

  &__content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    @include pad {
      flex-wrap: wrap;
    }
  }

  &__photo {
    position: relative;
    z-index: 1;

    @include mobile {
      margin-bottom: 50px;
    }

    img {
      width: 300px;
      height: 300px;
      margin-right: 20px;
      object-fit: cover;
      filter: grayscale(100%);

      @include min-mobile {
        width: 200px;
        height: 200px;
        margin-right: 0;
      }
    }

    // 黑色方塊：往左下偏移，壓在照片後面
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: -30px;
      width: 300px;
      height: 300px;
      background-color: var(--secondary);

      @include min-mobile {
        width: 200px;
        height: 200px;
      }
    }

    // 黃色長條：往右上撐出去，墊在最底層
    &::after {
      content: '';
      position: absolute;
      top: -100px;
      right: -40px;
      z-index: -1;
      width: 200px;
      height: 500px;
      background-color: var(--primary);

      @include mobile {
        top: -30px;
        right: -15px;
        width: 300px;
        height: 300px;
      }

      @include min-mobile {
        right: -30px;
        width: 200px;
        height: 200px;
      }
    }
  }

  &__text {
    z-index: 1;

    @include mobile {
      text-align: center;
    }

    h1 {
      @include display;
      font-size: 60px;

      @include min-mobile {
        font-size: 36px;
      }
    }

    p {
      @include body1-regular;
      color: var(--font);
    }
  }
}
</style>
