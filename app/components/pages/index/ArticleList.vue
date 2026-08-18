<script lang="ts" setup>
import { computed, ref } from 'vue'
import BaseCard from '@/components/common/card/BaseCard.vue'
import BaseButton from '@/components/common/button/BaseButton.vue'
import { useAssetUrl } from '@/composables/common/useAssetUrl'
import type { Article } from '@/types/api/article'

// legacy 的 #articleList + .moreBtn：一次載 5 筆，按鈕往後追加
const props = defineProps<{
  articles: Article[]
}>()

const assetUrl = useAssetUrl()
const PAGE_SIZE = 5
const shown = ref(PAGE_SIZE)

const visibleArticles = computed(() => props.articles.slice(0, shown.value))
const hasMore = computed(() => shown.value < props.articles.length)

const loadMore = () => {
  shown.value += PAGE_SIZE
}
</script>

<template>
  <div class="article-list">
    <BaseCard
      v-for="article in visibleArticles"
      :key="article.week"
      :to="`/article/${article.week}`"
      :title="article.title"
      :briefing="article.briefing"
      :image-url="assetUrl(article.largeCoverUrl)"
      :image-alt="`${article.city}${article.district}`"
      :badge="`WEEK ${article.week}`"
      :meta="`${article.city} ${article.district}`"
      :note="`by ${article.userName} - ${article.writtenDate}`"
    />

    <BaseButton
      v-if="hasMore"
      text="LOAD MORE POSTS"
      styling="secondary"
      append-icon="mdi:refresh"
      class="article-list__more"
      @click="loadMore"
    />
  </div>
</template>

<style lang="scss" scoped>
.article-list {
  &__more {
    width: calc(40% - 4px);
    margin: 20px 0;

    @include pad {
      width: 100%;
    }
  }
}
</style>
