<script lang="ts" setup>
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import { useArticles } from '@/composables/pages/useArticles'
import { useAssetUrl } from '@/composables/common/useAssetUrl'

// legacy 的 js/aside.js。首頁、文章頁、搜尋結果頁共用。
const assetUrl = useAssetUrl()
const { articles, topHashTags } = await useArticles()

const socials = [
  { label: 'EMAIL', href: 'mailto:s6102161021@yahoo.com.tw', icon: 'images/info-mail.png' },
  { label: 'PINTEREST', href: 'https://www.pinterest.com/meichenchan/vickys/', icon: 'images/info-pin.png' },
  { label: 'INSTAGRAM', href: 'https://www.instagram.com/s6102161021/', icon: 'images/info-ins.png' },
]

/**
 * legacy 是每次載入隨機抽 3 篇。這裡包在 useAsyncData 裡，
 * 讓抽選只在 prerender 時發生一次並寫進 payload——client 端直接沿用，
 * 否則 SSR 與 hydration 抽到不同結果會出現畫面閃動與 mismatch 警告。
 * 效果是每次重新部署換一批，符合原本的用意。
 */
const { data: popularWeeks } = await useAsyncData('aside-popular', async () => {
  const weeks = articles.value.map((article) => article.week)
  const picked: number[] = []
  while (picked.length < Math.min(3, weeks.length)) {
    const candidate = weeks[Math.floor(Math.random() * weeks.length)]
    if (candidate !== undefined && !picked.includes(candidate)) picked.push(candidate)
  }
  return picked
})

const popularPosts = computed(() =>
  (popularWeeks.value ?? [])
    .map((week) => articles.value.find((article) => article.week === week))
    .filter((article) => article !== undefined)
)
</script>

<template>
  <aside class="aside">
    <div class="aside__photo">
      <span />
      <img :src="assetUrl('images/profile.jpg')" alt="Vicky" >
    </div>

    <div class="aside__info">
      <ul>
        <li v-for="social in socials" :key="social.label">
          <a :href="social.href" :target="social.href.startsWith('http') ? '_blank' : undefined">
            <img :src="assetUrl(social.icon)" :alt="social.label" >
          </a>
        </li>
        <li>
          <NuxtLink to="/">
            <img :src="assetUrl('images/info-website.png')" alt="WEBSITE" >
          </NuxtLink>
        </li>
      </ul>
      <p>
        Hi，我是VC<br >我在2019年末<br >給自己一個生活目標<br >花了一年總共54週<br >每週探索一個地區<br >想與你分享我的小探險
      </p>
    </div>

    <section class="aside__popular">
      <h2>POPULAR POSTS</h2>
      <ul>
        <li v-for="post in popularPosts" :key="post.week">
          <NuxtLink :to="`/article/${post.week}`">
            <img :src="assetUrl(post.smallCoverUrl)" :alt="post.title" >
            <p>{{ post.title }}</p>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="aside__hashtag">
      <h2>HASHTAGS</h2>
      <ul>
        <li v-for="tag in topHashTags" :key="tag">
          <NuxtLink :to="{ path: '/result', query: { tags: tag } }">{{ tag }}</NuxtLink>
        </li>
      </ul>
    </section>

    <div class="aside__ad">
      <a href="https://www.pinterest.com/meichenchan/vickys/" target="_blank" class="is-desktop">
        <img :src="assetUrl('images/ad_300x450.jpg')" alt="設計服務" >
      </a>
      <a href="https://www.pinterest.com/meichenchan/vickys/" target="_blank" class="is-mobile">
        <img :src="assetUrl('images/ad_768x250.jpg')" alt="設計服務" >
      </a>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.aside {
  position: sticky;
  top: 76px;
  width: 200px;
  height: 100%;

  @include mobile {
    position: static;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  h2 {
    @include display;
    padding: 8px 0;
    margin-bottom: 10px;
    color: #ffffff;
    font-size: 1rem;
    letter-spacing: 1px;
    text-align: center;
    background-color: var(--secondary);

    @include mobile {
      margin-top: 20px;
    }

    @include min-mobile {
      margin-top: 0;
    }
  }

  // 頭像：黃色方塊往左下錯位，照片壓在右上
  &__photo {
    position: relative;
    width: 200px;
    height: 200px;
    margin-bottom: 10px;

    @include mobile {
      display: none;
    }

    span {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 185px;
      height: 185px;
      background-color: var(--primary);
      border-radius: var(--border-radius-s);
    }

    img {
      position: absolute;
      top: 0;
      right: 0;
      width: 185px;
      height: 185px;
      border-radius: var(--border-radius-s);
      filter: grayscale(100%) contrast(140%);
      transition: var(--transition-slow);
    }

    @include hover {
      img:hover {
        filter: grayscale(0%) contrast(120%);
      }
    }
  }

  &__info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    @include mobile {
      display: none;
    }

    ul {
      display: flex;
      flex-direction: column;
    }

    li {
      margin-bottom: 8px;
      transition: var(--transition-fast);

      @include hover {
        &:hover {
          transform: scale(1.2);
        }
      }
    }

    li:last-child {
      margin-bottom: 0;
    }

    img {
      width: 28px;
    }

    p {
      @include body2-regular;
      color: var(--font);
    }
  }

  &__popular {
    margin-bottom: 20px;

    @include mobile {
      width: 48%;
      padding: 0 1%;
    }

    @include min-mobile {
      width: 100%;
    }

    li {
      padding: 10px 0;
      line-height: 1.2;
      border-bottom: 1px solid var(--divider);
    }

    li:first-child {
      padding-top: 0;
    }

    li:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }

    a {
      display: flex;
      align-items: center;
    }

    p {
      @include body2-regular;
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }

    img {
      width: 70px;
      min-height: 70px;
      margin-right: 8px;
      object-fit: cover;
      border-radius: var(--border-radius-s);
      filter: grayscale(100%) contrast(1.2);
      transition: var(--transition-slow);

      @include min-mobile {
        width: 150px;
      }
    }

    @include hover {
      li:hover img {
        filter: grayscale(0%);
      }
    }
  }

  &__hashtag {
    margin-bottom: 20px;

    @include mobile {
      width: 48%;
      padding: 0 1%;
    }

    @include min-mobile {
      width: 100%;
    }

    li {
      @include body2-medium;
      display: inline-block;
      padding: 2px 6px;
      margin: 0 4px 4px 0;
      color: var(--secondary);
      background-color: var(--divider);
      border-radius: var(--border-radius-s);
      transition: var(--transition-fast);

      @include hover {
        &:hover {
          background-color: var(--primary);
        }
      }
    }
  }

  &__ad {
    filter: grayscale(100%);
    transition: var(--transition-fast);

    @include hover {
      &:hover {
        filter: grayscale(0%);
      }
    }

    img {
      border-radius: var(--border-radius-s);
    }

    .is-desktop {
      @include mobile {
        display: none;
      }
    }

    .is-mobile {
      display: none;

      @include mobile {
        display: block;
      }
    }
  }
}
</style>
