<script lang="ts" setup>
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { Destination } from '@/types/api/article'

/**
 * legacy 首頁的 Leaflet 地圖，改用 MapLibre GL。
 *
 * ⚠ 本元件一定要由呼叫端包在 <ClientOnly> 內：maplibre-gl 在模組載入時就會碰 window，
 *   prerender 階段載入會讓 nuxt generate 直接失敗。
 *
 * 圖磚沿用 legacy 的 OpenStreetMap raster，MapLibre 以 raster source 接。
 */
const props = defineProps<{
  destinations: Destination[]
}>()

const container = useTemplateRef<HTMLDivElement>('container')
const map = shallowRef<MapLibreMap | null>(null)

// 台灣本島的視野中心，與 legacy 相同
const TAIWAN_CENTER: [number, number] = [120.9738819, 23.97565]

onMounted(async () => {
  const [{ Map, Marker, Popup, NavigationControl }] = await Promise.all([
    import('maplibre-gl'),
    import('maplibre-gl/dist/maplibre-gl.css'),
  ])
  if (!container.value) return

  const instance = new Map({
    container: container.value,
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>｜已探索景點',
        },
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
    },
    center: TAIWAN_CENTER,
    zoom: 6.5,
  })

  instance.addControl(new NavigationControl(), 'top-right')

  props.destinations.forEach((destination) => {
    // db.json 的 local 是 [緯度, 經度]，MapLibre 要的是 [經度, 緯度]
    const [lat, lng] = destination.local
    const popup = new Popup({ offset: 24 }).setHTML(
      `<div class="map-popup">
        <h3>${destination.name}</h3>
        <p>不專業評價 ${destination.rate}</p>
        <a href="${destination.mapUrl}" target="_blank" rel="noopener">前往 ›</a>
      </div>`
    )
    new Marker({ color: '#000000' }).setLngLat([lng, lat]).setPopup(popup).addTo(instance)
  })

  map.value = instance
})

onBeforeUnmount(() => {
  map.value?.remove()
  map.value = null
})
</script>

<template>
  <div ref="container" class="destination-map" role="application" aria-label="已探索景點地圖" />
</template>

<style lang="scss">
// 不加 scoped：popup 的 HTML 是 MapLibre 動態插入的，scoped 的屬性選擇器選不到
.destination-map {
  width: 100%;
  height: 450px;
  border-radius: var(--border-radius-s);

  @include min-mobile {
    margin-bottom: 20px;
  }

  .map-popup {
    text-align: center;

    h3 {
      @include body1-medium;
      margin-bottom: 3px;
    }

    p {
      @include body2-regular;
      margin-bottom: 8px;
      color: var(--subtitle);
    }

    a {
      @include body2-medium;
      display: inline-block;
      padding: 4px 12px;
      color: var(--secondary);
      background-color: var(--primary);
      border-radius: var(--border-radius-s);
      transition: var(--transition-fast);
    }

    a:hover {
      color: #ffffff;
      background-color: var(--secondary);
    }
  }
}
</style>
