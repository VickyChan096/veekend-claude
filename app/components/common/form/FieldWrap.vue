<script lang="ts" setup>
// 表單欄位的外框。負責 label 與控制項的排列方式（上下 or 並排）。
withDefaults(
  defineProps<{
    label?: string
    /** label 與控制項並排 */
    inlineLabel?: boolean
    align?: 'start' | 'center' | 'stretch' | 'end'
    /** inlineLabel 時的 grid-template-columns */
    column?: string
  }>(),
  {
    label: undefined,
    inlineLabel: undefined,
    align: 'center',
    column: 'auto 1fr',
  }
)
</script>

<template>
  <div class="field-wrap" :class="{ 'inline-label': inlineLabel, 'no-label': !label }">
    <slot name="label" />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.field-wrap {
  width: 100%;
}
.inline-label {
  display: grid;
  align-items: v-bind(align);
  grid-template-columns: v-bind(column);
  gap: 0 8px;
}
.no-label {
  display: initial;
}
</style>
