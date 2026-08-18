<script lang="ts" setup>
import { useAssetUrl } from '@/composables/common/useAssetUrl'
import type { GalleryItem } from '@/types/api/articleContent'

// legacy 的 section.articleStyle5：三欄圖文
defineProps<{
  items: GalleryItem[]
}>()

const emit = defineEmits<{ (e: 'open-image', fullSrc: string): void }>()
const assetUrl = useAssetUrl()
</script>

<template>
  <section class="article-gallery">
    <div v-for="(item, itemIndex) in items" :key="itemIndex" class="article-gallery__column">
      <button
        type="button"
        class="article-gallery__image"
        :aria-label="item.heading ? `放大檢視：${item.heading}` : '放大檢視圖片'"
        @click="emit('open-image', item.image.fullSrc)"
      >
        <img :src="assetUrl(item.image.src)" :alt="item.image.alt ?? item.heading ?? ''" loading="lazy" >
      </button>
      <h3 v-if="item.heading">{{ item.heading }}</h3>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-if="item.html" v-html="item.html" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.article-gallery {
  display: flex;
  justify-content: space-between;
  padding-bottom: 20px;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 1px solid var(--divider);

  @include pad {
    flex-wrap: wrap;
    justify-content: center;
  }

  &__column {
    width: 32%;

    @include pad {
      width: 60%;
      margin-bottom: 20px;
    }

    @include mobile {
      width: 80%;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__image {
    display: block;
    width: 100%;
    padding: 0;
    margin-bottom: 8px;
    background: none;
    border: 0;

    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: var(--border-radius-s);

      @include pad {
        height: auto;
      }
    }

    &:focus-visible {
      outline: var(--focus-visible);
    }
  }

  h3 {
    @include body1-bold;
  }

  p {
    @include body2-regular;
    text-align: left;
  }

  :deep(a) {
    color: var(--secondary);
    text-decoration: underline;
  }

  :deep(.wikiHref) {
    font-size: 0.5rem;
    color: var(--subtitle);
  }
}
</style>
