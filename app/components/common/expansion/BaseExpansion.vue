<script lang="ts" setup>
export interface ExpansionItem {
  title: string
  text: string
}

defineProps<{
  items: ExpansionItem[]
  multiple?: boolean
}>()

const model = defineModel<number | number[] | null>()
</script>

<template>
  <VExpansionPanels v-model="model" :multiple="multiple" variant="accordion" class="base-expansion">
    <VExpansionPanel v-for="(item, panelIndex) in items" :key="panelIndex" :value="panelIndex">
      <VExpansionPanelTitle expand-icon="mdi:chevron-down" collapse-icon="mdi:chevron-up">
        {{ item.title }}
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <slot :name="`item.${panelIndex}`" :item="item">{{ item.text }}</slot>
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>

<style lang="scss" scoped>
.base-expansion {
  :deep(.v-expansion-panel-title) {
    @include body1-medium;
    color: var(--title);
  }
  :deep(.v-expansion-panel-text__wrapper) {
    @include body2-regular;
    color: var(--font);
  }
}
</style>
