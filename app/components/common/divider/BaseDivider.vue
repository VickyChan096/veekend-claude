<script lang="ts" setup>
withDefaults(
  defineProps<{
    vertical?: boolean
    /** 上下留白 */
    spacing?: string
  }>(),
  { spacing: '16px' }
)
</script>

<template>
  <VDivider :vertical="vertical" class="base-divider" />
</template>

<style lang="scss" scoped>
.base-divider {
  margin: v-bind(spacing) 0;
  border-color: var(--divider);
  opacity: 1;
}
</style>
