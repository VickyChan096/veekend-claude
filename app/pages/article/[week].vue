<script lang="ts" setup>
import { computed } from 'vue'
import { useHead, useRoute } from 'nuxt/app'
import PagePlaceholder from '@/components/pages/PagePlaceholder.vue'
import { useArticles } from '@/composables/pages/useArticles'

// legacy 的 article.html?week=N，改成路徑參數 /article/N。
// crawler 會從首頁與 header 選單的連結爬到每一週，各自產生一份靜態頁。
const route = useRoute()
const { articles } = await useArticles()

const week = computed(() => Number(route.params.week))
const article = computed(() => articles.value.find((item) => item.week === week.value) ?? null)

useHead(() => ({ title: `${article.value?.title ?? "文章"} | Veekend` }))
</script>

<template>
  <PagePlaceholder
    :title="article?.title ?? `找不到第 ${week} 週的文章`"
    note="Phase 5 移植 legacy-app/article6.html + js/article.js"
  />
</template>
