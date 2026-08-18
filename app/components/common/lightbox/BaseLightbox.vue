<script lang="ts" setup>
import { computed } from 'vue'
import BaseIconButton from '@/components/common/button/BaseIconButton.vue'

// 取代 legacy 文章頁的 Fancybox。用 VOverlay 實作，可左右切換。
const props = defineProps<{
  images: { src: string; alt?: string }[]
}>()

const open = defineModel<boolean>({ default: false })
const index = defineModel<number>('index', { default: 0 })

const current = computed(() => props.images[index.value])
const hasMultiple = computed(() => props.images.length > 1)

const prev = () => {
  index.value = (index.value - 1 + props.images.length) % props.images.length
}
const next = () => {
  index.value = (index.value + 1) % props.images.length
}
</script>

<template>
  <VOverlay
    v-model="open"
    class="base-lightbox"
    content-class="base-lightbox__content"
    scrim="#000000"
    opacity="0.9"
    aria-label="圖片檢視"
  >
    <BaseIconButton
      icon="mdi:close"
      label="關閉圖片檢視"
      class="base-lightbox__close"
      @click="open = false"
    />
    <BaseIconButton
      v-if="hasMultiple"
      icon="mdi:chevron-left"
      label="上一張"
      class="base-lightbox__nav is-prev"
      @click="prev"
    />
    <figure v-if="current" class="base-lightbox__figure">
      <img :src="current.src" :alt="current.alt ?? ''" >
      <figcaption v-if="current.alt">{{ current.alt }}</figcaption>
    </figure>
    <BaseIconButton
      v-if="hasMultiple"
      icon="mdi:chevron-right"
      label="下一張"
      class="base-lightbox__nav is-next"
      @click="next"
    />
  </VOverlay>
</template>

<style lang="scss" scoped>
.base-lightbox {
  :deep(.base-lightbox__content) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__figure {
    max-width: 90vw;
    max-height: 85vh;

    img {
      max-width: 90vw;
      max-height: 78vh;
      object-fit: contain;
    }

    figcaption {
      @include body2-regular;
      margin-top: 8px;
      color: #ffffff;
      text-align: center;
    }
  }

  &__close {
    position: absolute;
    top: 16px;
    right: 16px;
    color: #ffffff;
  }

  &__nav {
    position: absolute;
    color: #ffffff;

    &.is-prev {
      left: 16px;
    }
    &.is-next {
      right: 16px;
    }
  }
}
</style>
