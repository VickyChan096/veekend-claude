<script lang="ts" setup>
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import type { Map as MapLibreMap } from 'maplibre-gl'

interface Props {
  /** [經度, 緯度]——注意與 db.json 的 local[緯度, 經度] 順序相反 */
  center: [number, number]
  zoom?: number
}
const props = withDefaults(defineProps<Props>(), { zoom: 14 })

const container = useTemplateRef<HTMLDivElement>('container')
const map = shallowRef<MapLibreMap | null>(null)

onMounted(async () => {
  // maplibre-gl 在模組載入時就會碰 window，必須動態 import，
  // 且本元件一律由呼叫端包在 <ClientOnly> 內——否則 nuxt generate 會失敗。
  const [{ Map }] = await Promise.all([
    import('maplibre-gl'),
    import('maplibre-gl/dist/maplibre-gl.css'),
  ])
  if (!container.value) return

  map.value = new Map({
    container: container.value,
    // TODO(Phase 3): 換成正式的圖磚來源
    style: 'https://demotiles.maplibre.org/style.json',
    center: props.center,
    zoom: props.zoom,
  })
})

onBeforeUnmount(() => {
  map.value?.remove()
  map.value = null
})
</script>

<template>
  <div ref="container" class="base-map" />
</template>

<style lang="scss" scoped>
.base-map {
  width: 100%;
  height: 360px;
  border-radius: var(--border-radius-m);
}
</style>
