<script lang="ts" setup>
withDefaults(
  defineProps<{
    text: string
    location?: 'top' | 'bottom' | 'start' | 'end'
    maxWidth?: string
  }>(),
  {
    location: 'top',
    maxWidth: '260px',
  }
)
</script>

<template>
  <VTooltip :location="location" :max-width="maxWidth">
    <template #activator="{ props: activatorProps }">
      <span v-bind="activatorProps" class="base-tooltip__activator">
        <slot />
      </span>
    </template>
    {{ text }}
  </VTooltip>
</template>

<style lang="scss" scoped>
.base-tooltip__activator {
  display: inline-flex;
}
</style>
