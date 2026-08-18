<script lang="ts" setup>
import ExampleSection from '@/components/pages/example/ExampleSection.vue'
import ExampleRow from '@/components/pages/example/ExampleRow.vue'
import BaseButton from '@/components/common/button/BaseButton.vue'
import BaseIconButton from '@/components/common/button/BaseIconButton.vue'

const open = defineModel<boolean>({ default: false })
</script>

<template>
  <ExampleSection
    v-model="open"
    title="按鈕"
    note="primary 對應 legacy 的 .btnPrimary（黃底黑字，hover 反轉）、secondary 對應 .btnSecondary（白底黃框）"
  >
    <ExampleRow label="styling">
      <BaseButton text="Primary" styling="primary" />
      <BaseButton text="Secondary" styling="secondary" />
      <BaseButton text="Text" styling="text" />
    </ExampleRow>

    <ExampleRow label="size">
      <BaseButton text="Small" size="small" />
      <BaseButton text="Default" />
      <BaseButton text="Large" size="large" />
    </ExampleRow>

    <ExampleRow label="狀態">
      <BaseButton text="Disabled" disabled />
      <BaseButton text="Loading" loading />
      <BaseButton text="帶圖示" prepend-icon="mdi:map-marker" />
    </ExampleRow>

    <ExampleRow label="block">
      <BaseButton text="整列寬度" block />
    </ExampleRow>

    <ExampleRow label="BaseIconButton">
      <BaseIconButton icon="mdi:magnify" label="搜尋" />
      <BaseIconButton icon="mdi:heart-outline" label="收藏" styling="primary" />
      <BaseIconButton icon="mdi:share-variant" label="分享" size="small" />
    </ExampleRow>
  </ExampleSection>
</template>
