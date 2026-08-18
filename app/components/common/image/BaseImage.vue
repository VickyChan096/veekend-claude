<script lang="ts" setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue'

/**
 * 圖片的統一入口。做兩件事：
 *
 * 1. **建置時產生縮圖**——透過 `<NuxtImg>` 與 ipx，依 `sizes` 產出多種寬度與 WebP。
 *    原始圖檔不動，最佳化版本另外放在 `_ipx/`。
 *    ⚠ 一定要給 `sizes`，只給 quality 的話 ipx 只會重新編碼，檔案反而更大。
 *
 * 2. **載入前顯示灰色骨架**——用 CSS 背景做，圖片畫出來就自然蓋掉。
 *
 * ⚠ 這個元件**直接渲染成 `<img>`，不包任何外層 `<div>`**。
 *    包 wrapper 會讓所有既有的 `img { ... }` 樣式失效——側欄頭像、熱門文章縮圖、
 *    廣告都曾因此高度變成 0。要調尺寸就照舊直接寫在 img 上。
 *
 * 版位保留：`ratio` 會在載入完成前撐開 aspect-ratio，載入後交還給圖片本身的比例。
 * 已經用 CSS 指定固定尺寸的地方（卡片縮圖、hero）不必給 ratio。
 */
const props = withDefaults(
  defineProps<{
    /** 相對於 public/ 的路徑，例如 images/week1/cover.jpg */
    src: string
    alt?: string
    /** 響應式尺寸。預設值適用於內文的滿版圖 */
    sizes?: string
    /** 載入前用來撐開版位的長寬比。外層已有固定高度就不用給 */
    ratio?: string
    /** 首屏的圖片設 false，其餘維持延遲載入 */
    lazy?: boolean
  }>(),
  {
    alt: '',
    sizes: 'sm:100vw md:1024px',
    ratio: undefined,
    lazy: true,
  }
)

const loaded = ref(false)
const imgRef = useTemplateRef<{ $el?: HTMLImageElement } | HTMLImageElement>('img')

/**
 * 預先渲染的 HTML 讓瀏覽器在 Vue 接手之前就開始下載圖片。
 * 如果下載在 hydration 完成前就結束，load 事件早就過去了，
 * @load 監聽器永遠收不到——骨架就會一直卡著不消失。
 * 掛載時補檢查一次 complete。
 */
onMounted(() => {
  const el = imgRef.value
  const img = el && '$el' in el ? el.$el : (el as HTMLImageElement | null)
  if (img?.complete) loaded.value = true
})

// 載入完成後就把 aspect-ratio 拿掉，交還給圖片的實際比例
const reserveStyle = computed(() =>
  props.ratio && !loaded.value ? { aspectRatio: props.ratio } : undefined
)
</script>

<template>
  <NuxtImg
    ref="img"
    :src="src"
    :alt="alt"
    :sizes="sizes"
    :loading="lazy ? 'lazy' : 'eager'"
    :preload="!lazy"
    :style="reserveStyle"
    format="webp"
    class="base-image"
    :class="{ 'is-loaded': loaded }"
    @load="loaded = true"
    @error="loaded = true"
  />
</template>

<style lang="scss" scoped>
// 骨架：畫在圖片自己的背景上，圖片畫出來就蓋掉，不需要額外的 DOM 節點
.base-image {
  background-color: var(--container);
  background-image: linear-gradient(
    90deg,
    var(--container) 0%,
    var(--divider) 50%,
    var(--container) 100%
  );
  background-size: 200% 100%;
  animation: base-image-shimmer 1.4s ease-in-out infinite;
}

.base-image.is-loaded {
  background: none;
  animation: none;
}

@keyframes base-image-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-image {
    animation: none;
  }
}
</style>
