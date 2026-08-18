<script lang="ts" setup>
import type { OptionBase, SelectValue } from '@/types/common/form/OptionBase'

defineProps<{
  items: OptionBase<SelectValue>[]
  ariaLabel?: string
}>()

const model = defineModel<SelectValue>()
</script>

<template>
  <VTabs
    v-model="model"
    :aria-label="ariaLabel"
    color="primary"
    slider-color="primary"
    density="compact"
    class="base-tab"
  >
    <VTab v-for="item in items" :key="String(item.value)" :value="item.value">{{ item.text }}</VTab>
  </VTabs>
</template>

<style lang="scss" scoped>
.base-tab {
  border-bottom: 1px solid var(--divider);

  :deep(.v-tab) {
    @include body1-medium;
    color: var(--subtitle);
    text-transform: none;
    letter-spacing: normal;
  }
  :deep(.v-tab--selected) {
    color: var(--font);
  }
}
</style>
