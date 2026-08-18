<script lang="ts" setup>
import { computed } from 'vue'
import { createError, useAsyncData, useHead, useRoute } from 'nuxt/app'
import ArticleHero from '@/components/pages/article/ArticleHero.vue'
import ArticleBody from '@/components/pages/article/ArticleBody.vue'
import ArticleMapAndTags from '@/components/pages/article/ArticleMapAndTags.vue'
import ArticleNav from '@/components/pages/article/ArticleNav.vue'
import SiteAside from '@/components/layouts/SiteAside.vue'
import { articleService } from '@/services/pages/ArticleService'
import { useAssetUrl } from '@/composables/common/useAssetUrl'
import { stripHtml } from '@/utils/common/text'

// legacy 的 article.html?week=N，改成路徑參數 /article/N。
// crawler 會從首頁與 header 選單的連結爬到每一週，各自產生一份靜態頁。
const route = useRoute()
const { absoluteUrl } = useAssetUrl()
const week = computed(() => Number(route.params.week))

const { data } = await useAsyncData(`article-${week.value}`, async () => {
  const article = await articleService.findByWeek(week.value)
  if (!article) return null
  const neighbours = await articleService.findNeighbours(week.value)
  return { article, ...neighbours }
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: `找不到第 ${week.value} 週的文章`, fatal: true })
}

const article = computed(() => data.value!.article)
const areaLabel = computed(() => `${article.value.city}${article.value.district}`)
const hasContent = computed(() => article.value.blocks.length > 0)

useHead(() => ({
  title: `Week ${article.value.week} - ${areaLabel.value} | Veekend`,
  meta: [
    { name: 'description', content: stripHtml(article.value.briefing) },
    { property: 'og:title', content: `Week ${article.value.week} - ${areaLabel.value} | Veekend` },
    { property: 'og:description', content: stripHtml(article.value.briefing) },
    // 社群平台不吃相對路徑，一定要絕對網址才會有預覽圖
    { property: 'og:image', content: absoluteUrl(article.value.largeCoverUrl) },
    { property: 'og:url', content: absoluteUrl(`article/${article.value.week}/`) },
    { property: 'og:type', content: 'article' },
  ],
}))
</script>

<template>
  <div class="article-page">
    <ArticleHero :article="article" />

    <div class="article-page__content">
      <article class="article-page__main">
        <header class="article-page__top">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <h1 v-html="article.title" />
          <p class="article-page__byline">
            written by {{ article.userName }} ｜ {{ article.writtenDate }}
          </p>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p class="article-page__brief" v-html="article.briefing" />
        </header>

        <ArticleBody v-if="hasContent" :blocks="article.blocks" />
        <p v-else class="article-page__empty">這篇還在趕稿中，敬請期待 ｡ﾟ(ﾟ´ω`ﾟ)ﾟ｡</p>

        <ArticleMapAndTags
          v-if="article.destinations.length"
          :destinations="article.destinations"
          :hash-tags="article.hashTags"
          :area-label="areaLabel"
        />

        <ArticleNav :prev="data!.prev" :next="data!.next" />
      </article>

      <SiteAside />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-page {
  &__content {
    display: flex;
    justify-content: space-between;
    max-width: 1200px;
    padding: 0 30px 30px;
    margin: 0 auto;

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

  &__top {
    text-align: center;
  }

  // legacy 的標題：黃色粗底線壓在字的下半部
  &__top h1 {
    margin: 0 24px 10px;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.4;
    text-decoration: underline;
    text-decoration-color: var(--primary);
    text-decoration-thickness: 20px;
    text-decoration-skip-ink: none;
    text-underline-offset: -12px;
    user-select: none;

    @include pad {
      font-size: 30px;
      line-height: 1.2;
      text-decoration-thickness: 16px;
      text-underline-offset: -8px;
    }
  }

  &__byline {
    @include body2-regular;
    margin-bottom: 10px;
    color: var(--placeholder);
  }

  &__brief {
    @include body1-regular;
    margin-bottom: 20px;
    text-align: left;
  }

  &__empty {
    @include body1-regular;
    padding: 60px 0;
    color: var(--subtitle);
    text-align: center;
  }
}
</style>
