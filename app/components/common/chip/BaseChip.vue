<script lang="ts" setup>
import { computed } from 'vue'

// 對應 legacy 文章的 hashTags
const props = withDefaults(
  defineProps<{
    text: string
    to?: string
    size?: 'x-small' | 'small' | 'default'
    closable?: boolean
    prependIcon?: string
    // Custom Options:
    // tag 是 legacy 文章 hashTags 的樣子：灰底藥丸，hover 轉黃
    styling?: 'primary' | 'outlined' | 'plain' | 'tag'
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

// tag 的底色由下面的 CSS 給，Vuetify 只負責形狀
const chipVariant = computed(() => {
  if (props.styling === 'outlined') return 'outlined'
  if (props.styling === 'plain') return 'text'
  return 'flat'
})
</script>

<template>
  <VChip
    :to="to"
    :size="size"
    :closable="closable"
    :prepend-icon="prependIcon"
    :variant="chipVariant"
    :color="styling === 'primary' || styling === 'outlined' ? 'primary' : undefined"
    class="base-chip"
    :class="{ 'is-tag': styling === 'tag' }"
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

// legacy 的標籤：灰底、hover 轉黃
.base-chip.is-tag {
  background-color: var(--divider);
  transition: var(--transition-fast);

  @include hover {
    &:hover {
      background-color: var(--primary);
    }
  }
}
</style>
