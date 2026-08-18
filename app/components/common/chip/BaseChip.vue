<script lang="ts" setup>
// 對應 legacy 文章的 hashTags
withDefaults(
  defineProps<{
    text: string
    to?: string
    size?: 'x-small' | 'small' | 'default'
    closable?: boolean
    prependIcon?: string
    // Custom Options:
    styling?: 'primary' | 'outlined' | 'plain'
  }>(),
  {
    to: undefined,
    size: 'small',
    prependIcon: undefined,
    // Custom Options:
    styling: 'primary',
  }
)
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <VChip
    :to="to"
    :size="size"
    :closable="closable"
    :prepend-icon="prependIcon"
    :variant="styling === 'primary' ? 'flat' : styling === 'outlined' ? 'outlined' : 'text'"
    :color="styling === 'plain' ? undefined : 'primary'"
    class="base-chip"
    @click:close="emit('close')"
  >
    {{ text }}
  </VChip>
</template>

<style lang="scss" scoped>
.base-chip {
  @include body2-medium;
  color: var(--secondary);
  border-radius: var(--border-radius-s);
}
</style>
