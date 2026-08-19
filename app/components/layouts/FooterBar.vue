<script lang="ts" setup>
import { useAssetUrl } from '@/composables/common/useAssetUrl'

const { assetUrl } = useAssetUrl()

const links = [
  { label: 'EMAIL', href: 'mailto:s6102161021@yahoo.com.tw', icon: 'images/info-mail-y.png' },
  { label: 'PINTEREST', href: 'https://www.pinterest.com/meichenchan/vickys/', icon: 'images/info-pin-y.png' },
  { label: 'INSTAGRAM', href: 'https://www.instagram.com/s6102161021/', icon: 'images/info-ins-y.png' },
  { label: 'WEBSITE', href: '/', icon: 'images/info-website-y.png' },
]
</script>

<template>
  <footer class="footer">
    <div class="footer__photo" :style="{ backgroundImage: `url(${assetUrl('images/footer.jpg')})` }" />
    <ul class="footer__info">
      <li v-for="link in links" :key="link.label">
        <NuxtLink v-if="link.href === '/'" :to="link.href">
          <img :src="assetUrl(link.icon)" :alt="link.label" >
          <span>{{ link.label }}</span>
        </NuxtLink>
        <a v-else :href="link.href" :target="link.href.startsWith('http') ? '_blank' : undefined">
          <img :src="assetUrl(link.icon)" :alt="link.label" >
          <span>{{ link.label }}</span>
        </a>
      </li>
    </ul>
    <div class="footer__meta">
      <!-- 元件庫沒放在主選單裡（不是給讀者看的），但也不該只有知道網址的人才進得去 -->
      <NuxtLink to="/example" class="footer__example">元件庫</NuxtLink>
      <p class="footer__copyright">Copyright 2022 © Vicky Chan</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  color: #ffffff;
  background-color: var(--frame);

  &__photo {
    width: 100%;
    height: 300px;
    background-size: cover;
    background-position: center;
    filter: grayscale(100%) contrast(1.5);

    @include mobile {
      height: 150px;
    }
  }

  &__info {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 0 16px;
    border-bottom: 1px solid #3a3a3a;

    li {
      position: relative;
      margin: 0 8px;

      a {
        color: #ffffff;
      }

      img {
        display: none;
        width: 40px;
        transition: var(--transition-slow);
      }

      @include mobile {
        img {
          display: block;
        }
        span {
          display: none;
        }
      }

      // legacy 的黃色底線：hover 時從中間展開
      &::after {
        content: '';
        position: absolute;
        top: 24px;
        left: 50%;
        width: 0;
        border-bottom: 4px solid var(--primary);
        transform: translateX(-50%);
        transition: var(--transition-fast);
      }

      @include hover {
        &:hover::after {
          width: 100%;
        }
      }

      @include mobile {
        &:hover::after {
          width: 0;
        }
      }
    }
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }

  &__example {
    @include body2-regular;
    padding: 8px 0 0;
    color: #7a7a7a;
    text-decoration: underline;
    transition: var(--transition-fast);

    @include hover {
      &:hover {
        color: var(--primary);
      }
    }

    &:focus-visible {
      outline: var(--focus-visible);
    }
  }

  &__copyright {
    @include body2-regular;
    padding: 8px 0 32px;
    color: #7a7a7a;
    text-align: center;
  }
}
</style>
