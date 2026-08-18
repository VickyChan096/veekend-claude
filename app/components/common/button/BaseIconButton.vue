<script lang="ts" setup>
const emit = defineEmits<{ (e: 'click'): void }>()
withDefaults(
  defineProps<{
    /** @nuxt/icon 的圖示名稱，例如 mdi:magnify */
    icon: string
    /**
     * 無障礙必填：說明這顆按鈕做什麼。會同時當成 aria-label 與 title。
     * 刻意不叫 ariaLabel——那會與原生 aria-label 屬性撞名，型別檢查認不出來。
     */
    label: string
    to?: string
    size?: 'x-small' | 'small' | 'default' | 'large'
    disabled?: boolean
    // Custom Options:
    styling?: 'primary' | 'plain'
  }>(),
  {
    to: undefined,
    size: 'default',
    // Custom Options:
    styling: 'plain',
  }
)
</script>

<template>
  <VBtn
    :to="to"
    :size="size"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
    :variant="styling === 'primary' ? 'flat' : 'text'"
    :color="styling === 'primary' ? 'primary' : undefined"
    icon
    class="base-icon-button"
    @click="emit('click')"
  >
    <Icon :name="icon" />
  </VBtn>
</template>

<style lang="scss" scoped>
.base-icon-button {
  color: var(--font);
  transition: var(--transition-fast);
}
</style>
