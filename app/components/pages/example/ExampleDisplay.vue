<script lang="ts" setup>
import { ref } from 'vue'
import ExampleSection from '@/components/pages/example/ExampleSection.vue'
import ExampleRow from '@/components/pages/example/ExampleRow.vue'
import BaseCard from '@/components/common/card/BaseCard.vue'
import BaseImage from '@/components/common/image/BaseImage.vue'
import BaseChip from '@/components/common/chip/BaseChip.vue'
import BaseRating from '@/components/common/rating/BaseRating.vue'
import BaseDivider from '@/components/common/divider/BaseDivider.vue'
import BaseTooltip from '@/components/common/tooltip/BaseTooltip.vue'
import BreadCrumbs from '@/components/common/breadcrumbs/BreadCrumbs.vue'
import type { BreadcrumbsItem } from '@/types/common/breadcrumbs/BreadcrumbsItem'

const open = defineModel<boolean>({ default: false })

const crumbs: BreadcrumbsItem[] = [
  { title: '首頁', to: '/' },
  // 示範用途，指向現有路由——prerender crawler 會跟著爬，連到不存在的頁面會讓 generate 失敗
  { title: '文章', to: '/example' },
  { title: 'ORION BEER FEST in TAIPEI' },
]
const rating = ref(4.2)
</script>

<template>
  <ExampleSection v-model="open" title="展示元件" note="BaseCard 的圖片預設灰階，hover 才放大回彩色——沿用 legacy 的識別設計">
    <ExampleRow label="BaseCard">
      <div class="card-demo">
        <BaseCard
          to="/example"
          title="ORION BEER FEST in TAIPEI 一起狂喝一整晚!"
          briefing="這禮拜是 Veekend 計畫的第一週，聽朋友說花博有個 Orion 啤酒之夜。第一週就先簡單安排行程，吃飽飯就緩緩散步去會場。"
          badge="WEEK 01"
          meta="台北市 中山區"
          note="造訪於 2019.10.20"
        />
      </div>
    </ExampleRow>

    <ExampleRow label="BaseImage">
      <div class="image-demo">
        <BaseImage src="images/week1/cover.jpg" alt="封面" sizes="sm:100vw md:480px" rounded />
        <p class="image-demo__note">
          載入前會顯示灰色骨架。圖片由 ipx 在建置時依 sizes 產生 WebP 縮圖，原始檔不動。
        </p>
      </div>
    </ExampleRow>

    <ExampleRow label="BaseChip">
      <BaseChip text="美食" />
      <BaseChip text="展覽" styling="outlined" />
      <BaseChip text="戶外" styling="plain" />
      <BaseChip text="#野餐" styling="tag" />
      <BaseChip text="可關閉" closable />
    </ExampleRow>

    <ExampleRow label="BaseRating">
      <BaseRating :model-value="rating" show-value />
      <BaseRating :model-value="5" size="default" />
    </ExampleRow>

    <ExampleRow label="BaseTooltip">
      <BaseTooltip text="這是說明文字">
        <BaseChip text="滑上來看看" styling="outlined" />
      </BaseTooltip>
    </ExampleRow>

    <ExampleRow label="BreadCrumbs">
      <BreadCrumbs :items="crumbs" />
    </ExampleRow>

    <ExampleRow label="BaseDivider">
      <div class="divider-demo">
        <p>上面</p>
        <BaseDivider />
        <p>下面</p>
      </div>
    </ExampleRow>
  </ExampleSection>
</template>

<style lang="scss" scoped>
.image-demo {
  width: 100%;
  max-width: 480px;

  &__note {
    @include body2-regular;
    margin-top: 8px;
    color: var(--subtitle);
  }
}
.card-demo {
  width: 100%;
  max-width: 560px;
}
.divider-demo {
  width: 100%;
}
</style>
