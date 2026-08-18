<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import BaseCard from '@/components/common/card/BaseCard.vue'
import BaseButton from '@/components/common/button/BaseButton.vue'
import type { Article } from '@/types/api/article'

// legacy 的 #articleList + .moreBtn。首頁一次載 5 筆，搜尋結果頁一次全出。
const props = withDefaults(
  defineProps<{
    articles: Article[]
    /** 一次顯示幾筆，0 表示全部顯示、不出 LOAD MORE */
    pageSize?: number
    /** 沒有結果時顯示的文字 */
    emptyText?: string
  }>(),
  {
    pageSize: 5,
    emptyText: '沒有符合的文章',
  }
)

const shown = ref(props.pageSize)

// 搜尋條件變了要把已展開的筆數收回去
watch(
  () => props.articles,
  () => {
    shown.value = props.pageSize
  }
)

const visibleArticles = computed(() =>
  props.pageSize === 0 ? props.articles : props.articles.slice(0, shown.value)
)
const hasMore = computed(() => props.pageSize !== 0 && shown.value < props.articles.length)

const loadMore = () => {
  shown.value += props.pageSize
}
</script>

<template>
  <div class="article-list">
    <p v-if="!articles.length" class="article-list__empty">{{ emptyText }}</p>

    <BaseCard
      v-for="article in visibleArticles"
      :key="article.week"
      :to="`/article/${article.week}`"
      :title="article.title"
      :briefing="article.briefing"
      :image-url="article.largeCoverUrl"
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
  &__empty {
    @include body1-regular;
    padding: 60px 0;
    color: var(--subtitle);
    text-align: center;
  }

  &__more {
    width: calc(40% - 4px);
    margin: 20px 0;

    @include pad {
      width: 100%;
    }
  }
}
</style>
