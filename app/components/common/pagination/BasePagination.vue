<script lang="ts" setup>
withDefaults(
  defineProps<{
    length: number
    totalVisible?: number
    ariaLabel?: string
  }>(),
  {
    totalVisible: 5,
    ariaLabel: '分頁',
  }
)

const model = defineModel<number>({ default: 1 })
</script>

<template>
  <VPagination
    v-model="model"
    :length="length"
    :total-visible="totalVisible"
    :aria-label="ariaLabel"
    active-color="primary"
    density="comfortable"
    prev-icon="mdi:chevron-left"
    next-icon="mdi:chevron-right"
    class="base-pagination"
  />
</template>

<style lang="scss" scoped>
.base-pagination :deep(.v-btn) {
  @include body2-regular;
}
</style>
