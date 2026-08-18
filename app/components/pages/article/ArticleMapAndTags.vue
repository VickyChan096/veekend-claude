<script lang="ts" setup>
import DestinationMap from '@/components/pages/index/DestinationMap.vue'
import type { Destination } from '@/types/api/article'

// legacy 的 .article__mapAndTags：本週景點地圖 + hashTags
defineProps<{
  destinations: Destination[]
  hashTags: string[]
  /** 地圖 attribution 要標的地區，例如「台北市中山區」 */
  areaLabel: string
}>()
</script>

<template>
  <section class="article-map">
    <h2>本週景點地圖</h2>

    <ClientOnly>
      <DestinationMap
        :destinations="destinations"
        :area-label="areaLabel"
        height="350px"
        :zoom="14"
        focus="first"
      />
      <template #fallback>
        <div class="article-map__fallback">地圖載入中…</div>
      </template>
    </ClientOnly>

    <ul v-if="hashTags.length" class="article-map__tags">
      <li v-for="tag in hashTags" :key="tag">
        <NuxtLink :to="{ path: '/result', query: { tags: tag } }">#{{ tag }}</NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.article-map {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--divider);

  h2 {
    @include body1-bold;
    margin-bottom: 10px;
  }

  &__fallback {
    @include body2-regular;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 350px;
    color: var(--subtitle);
    background-color: var(--container);
    border-radius: var(--border-radius-s);
  }

  &__tags {
    width: 100%;
    margin-top: 20px;

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
}
</style>
