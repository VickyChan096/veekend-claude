<script lang="ts" setup>
// 取代 legacy 首頁的 Swiper。Swiper 的 parallax 效果改用 CSS transition 近似，不再引入 Swiper。
withDefaults(
  defineProps<{
    height?: string
    /** 自動輪播間隔（毫秒），0 表示不自動 */
    interval?: number
    hideDelimiters?: boolean
    showArrows?: boolean
  }>(),
  {
    height: '520px',
    interval: 0,
    showArrows: true,
  }
)

const model = defineModel<number>({ default: 0 })
</script>

<template>
  <VCarousel
    v-model="model"
    :height="height"
    :cycle="interval > 0"
    :interval="interval > 0 ? interval : undefined"
    :hide-delimiters="hideDelimiters"
    :show-arrows="showArrows"
    class="base-carousel"
    delimiter-icon="mdi:minus"
    prev-icon="mdi:chevron-left"
    next-icon="mdi:chevron-right"
  >
    <slot />
  </VCarousel>
</template>

<style lang="scss" scoped>
.base-carousel {
  border-radius: var(--border-radius-s);

  :deep(.v-btn) {
    color: var(--primary);
  }
}
</style>
