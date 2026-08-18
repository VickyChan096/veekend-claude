<script lang="ts" setup>
import { useAssetUrl } from '@/composables/common/useAssetUrl'
import type { Article } from '@/types/api/article'

// legacy 的 .article__bottom：上一篇／下一篇。頭尾各自顯示「沒有上／下一篇囉」
defineProps<{
  prev: Article | null
  next: Article | null
}>()

const assetUrl = useAssetUrl()
</script>

<template>
  <nav class="article-nav" aria-label="文章導覽">
    <component
      :is="prev ? 'NuxtLink' : 'div'"
      :to="prev ? `/article/${prev.week}` : undefined"
      class="article-nav__prev"
      :class="{ 'is-empty': !prev }"
    >
      <img :src="assetUrl('images/arrow.svg')" alt="" aria-hidden="true" >
      <div>
        <strong>Prev Post</strong>
        <p>{{ prev?.title ?? '沒有上一篇囉(◞‸◟)' }}</p>
      </div>
    </component>

    <component
      :is="next ? 'NuxtLink' : 'div'"
      :to="next ? `/article/${next.week}` : undefined"
      class="article-nav__next"
      :class="{ 'is-empty': !next }"
    >
      <div>
        <strong>Next Post</strong>
        <p>{{ next?.title ?? '沒有下一篇囉(◞‸◟)' }}</p>
      </div>
      <img :src="assetUrl('images/arrow.svg')" alt="" aria-hidden="true" >
    </component>
  </nav>
</template>

<style lang="scss" scoped>
.article-nav {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;

  @include mobile {
    margin-bottom: 20px;
  }

  &__prev,
  &__next {
    display: flex;
    align-items: center;
    width: 50%;
    padding: 12px 0;
    color: var(--font);
    transition: var(--transition-fast);
  }

  &__next {
    justify-content: flex-end;
    text-align: right;
  }

  strong {
    @include body2-bold;
    display: block;
    color: var(--subtitle);
  }

  p {
    @include body2-regular;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;

    @include mobile {
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
  }

  img {
    width: 30px;
    margin: 0 10px;
    transition: var(--transition-fast);

    @include mobile {
      width: 20px;
      margin: 0 5px;
    }
  }

  &__prev img {
    rotate: 180deg;
  }

  .is-empty {
    color: var(--placeholder);

    img {
      opacity: 0.3;
    }
  }

  @include hover {
    &__prev:not(.is-empty):hover img {
      transform: translateX(-6px);
    }
    &__next:not(.is-empty):hover img {
      transform: translateX(6px);
    }
  }
}
</style>
