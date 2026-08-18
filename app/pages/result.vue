<script lang="ts" setup>
import { computed } from 'vue'
import { useHead, useRoute } from 'nuxt/app'
import ResultHeading from '@/components/pages/result/ResultHeading.vue'
import ArticleList from '@/components/common/article/ArticleList.vue'
import SiteAside from '@/components/layouts/SiteAside.vue'
import BaseLoading from '@/components/common/loading/BaseLoading.vue'
import { useArticles } from '@/composables/pages/useArticles'
import { useArticleSearch } from '@/composables/pages/useArticleSearch'

// legacy 的 result.html + js/result.js。
// 純靜態站的 query 只有 client 端拿得到，所以結果區包在 <ClientOnly> 裡。
const route = useRoute()
const { articles } = await useArticles()
const query = computed(() => route.query)
const { results, heading, mode } = useArticleSearch(articles, query)

useHead(() => ({
  title: mode.value === 'none' ? '全部文章 | Veekend' : `${heading.value} | Veekend`,
}))
</script>

<template>
  <div class="result-page">
    <article class="result-page__main">
      <ClientOnly>
        <ResultHeading :heading="heading" :count="results.length" />
        <ArticleList :articles="results" :page-size="0" empty-text="沒有符合的文章，換個關鍵字試試" />

        <template #fallback>
          <BaseLoading block text="搜尋中" />
        </template>
      </ClientOnly>
    </article>

    <SiteAside />
  </div>
</template>

<style lang="scss" scoped>
.result-page {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  padding: 20px 30px 30px;
  margin: 0 auto;

  @include mobile {
    flex-wrap: wrap;
    padding: 20px 15px 30px;
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
}
</style>
