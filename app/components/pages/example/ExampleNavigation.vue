<script lang="ts" setup>
import { ref } from 'vue'
import ExampleSection from '@/components/pages/example/ExampleSection.vue'
import ExampleRow from '@/components/pages/example/ExampleRow.vue'
import BaseTab from '@/components/common/tab/BaseTab.vue'
import BasePagination from '@/components/common/pagination/BasePagination.vue'
import BaseExpansion from '@/components/common/expansion/BaseExpansion.vue'
import BaseTable from '@/components/common/table/BaseTable.vue'
import type { TableHeader } from '@/components/common/table/BaseTable.vue'
import type { ExpansionItem } from '@/components/common/expansion/BaseExpansion.vue'
import type { OptionBase, SelectValue } from '@/types/common/form/OptionBase'

const open = defineModel<boolean>({ default: false })

const tab = ref<SelectValue | undefined>('all')
const page = ref(1)
const panel = ref<number | number[] | null>(null)

const tabItems: OptionBase<SelectValue>[] = [
  { text: '全部', value: 'all' },
  { text: '美食', value: 'food' },
  { text: '展覽', value: 'exhibition' },
]
const panels: ExpansionItem[] = [
  { title: 'Veekend 是什麼？', text: '一個用週末走訪台灣各地的紀錄計畫。' },
  { title: '多久更新一次？', text: '原則上每週一篇。' },
]
const headers: TableHeader[] = [
  { title: '週次', key: 'week', width: '80px' },
  { title: '地點', key: 'city' },
  { title: '標題', key: 'title' },
  { title: '評分', key: 'rate', align: 'end', width: '80px' },
]
const rows: Record<string, unknown>[] = [
  { week: 1, city: '台北市 中山區', title: 'ORION BEER FEST in TAIPEI', rate: 4.2 },
  { week: 2, city: '新北市 淡水區', title: '淡水河邊的一日散步', rate: 3.9 },
]
</script>

<template>
  <ExampleSection v-model="open" title="導覽與資料">
    <ExampleRow label="BaseTab">
      <BaseTab v-model="tab" :items="tabItems" aria-label="文章分類" />
    </ExampleRow>

    <ExampleRow label="BaseTable">
      <BaseTable :headers="headers" :items="rows" caption="文章列表範例" />
    </ExampleRow>

    <ExampleRow label="BaseTable（無資料）">
      <BaseTable :headers="headers" :items="[]" empty-text="還沒有文章" />
    </ExampleRow>

    <ExampleRow label="BasePagination">
      <BasePagination v-model="page" :length="8" />
    </ExampleRow>

    <ExampleRow label="BaseExpansion">
      <BaseExpansion v-model="panel" :items="panels" />
    </ExampleRow>
  </ExampleSection>
</template>
