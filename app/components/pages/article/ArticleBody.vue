<script lang="ts" setup>
import { computed, ref } from 'vue'
import ArticleCatalog from '@/components/pages/article/ArticleCatalog.vue'
import ArticleSection from '@/components/pages/article/ArticleSection.vue'
import ArticleGallery from '@/components/pages/article/ArticleGallery.vue'
import BaseLightbox from '@/components/common/lightbox/BaseLightbox.vue'
import { useAssetUrl } from '@/composables/common/useAssetUrl'
import type { ArticleBlock } from '@/types/api/articleContent'

/**
 * 內文渲染器：把解析好的區塊分派給對應元件。
 * 燈箱集中在這一層——所有內文圖片共用同一個 BaseLightbox，可左右切換。
 */
const props = defineProps<{
  blocks: ArticleBlock[]
}>()

const { assetUrl } = useAssetUrl()
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

/** 依出現順序蒐集全部圖片，燈箱才能左右切換 */
const images = computed(() => {
  const collected: { src: string; alt?: string }[] = []

  props.blocks.forEach((block) => {
    if (block.type === 'gallery') {
      block.items.forEach((item) => {
        collected.push({ src: assetUrl(item.image.fullSrc), alt: item.image.alt ?? item.heading })
      })
      return
    }
    if (block.type !== 'section') return

    block.parts.forEach((part) => {
      if (part.kind === 'image' || part.kind === 'imageText') {
        collected.push({ src: assetUrl(part.image.fullSrc), alt: part.image.caption ?? part.image.alt })
      }
    })
  })

  return collected
})

const openImage = (fullSrc: string) => {
  const target = assetUrl(fullSrc)
  const index = images.value.findIndex((image) => image.src === target)
  if (index === -1) return
  lightboxIndex.value = index
  lightboxOpen.value = true
}
</script>

<template>
  <div class="article-body">
    <template v-for="(block, blockIndex) in blocks" :key="blockIndex">
      <ArticleCatalog v-if="block.type === 'catalog'" :label="block.label" :items="block.items" />
      <ArticleGallery
        v-else-if="block.type === 'gallery'"
        :items="block.items"
        @open-image="openImage"
      />
      <ArticleSection
        v-else
        :layout="block.layout"
        :anchor-id="block.anchorId"
        :parts="block.parts"
        @open-image="openImage"
      />
    </template>

    <BaseLightbox v-model="lightboxOpen" v-model:index="lightboxIndex" :images="images" />
  </div>
</template>

<style lang="scss" scoped>
.article-body {
  width: 100%;
}
</style>
