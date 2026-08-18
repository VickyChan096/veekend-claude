<script lang="ts" setup>
export interface TableHeader {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  width?: string
}

withDefaults(
  defineProps<{
    headers: TableHeader[]
    items: Record<string, unknown>[]
    /** 無資料時顯示的文字 */
    emptyText?: string
    loading?: boolean
    /** 給螢幕閱讀器的表格說明 */
    caption?: string
  }>(),
  {
    emptyText: '沒有資料',
    caption: undefined,
  }
)
</script>

<template>
  <div class="base-table-wrap">
    <table class="base-table">
      <caption v-if="caption" class="sr-only">{{ caption }}</caption>
      <thead>
        <tr>
          <th
            v-for="header in headers"
            :key="header.key"
            scope="col"
            :style="{ width: header.width, textAlign: header.align ?? 'start' }"
          >
            {{ header.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="headers.length" class="base-table__empty">載入中…</td>
        </tr>
        <tr v-else-if="!items.length">
          <td :colspan="headers.length" class="base-table__empty">{{ emptyText }}</td>
        </tr>
        <template v-else>
          <tr v-for="(item, rowIndex) in items" :key="rowIndex">
            <td
              v-for="header in headers"
              :key="header.key"
              :style="{ textAlign: header.align ?? 'start' }"
            >
              <slot :name="`item.${header.key}`" :item="item">{{ item[header.key] }}</slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.base-table-wrap {
  width: 100%;
  overflow-x: auto;
}
.base-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 8px;
    border-bottom: 1px solid var(--divider);
  }
  th {
    @include body2-bold;
    color: var(--subtitle);
    white-space: nowrap;
    background-color: var(--container);
  }
  td {
    @include body2-regular;
    color: var(--font);
  }
  &__empty {
    color: var(--placeholder);
    text-align: center;
  }
}
</style>
