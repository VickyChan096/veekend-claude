<script lang="ts" setup>
import { computed } from 'vue'

// 外觀對應 legacy 的 .btnPrimary（實心黃）與 .btnSecondary（白底黃框）。
const emit = defineEmits<{ (e: 'click'): void }>()
const props = withDefaults(
  defineProps<{
    to?: string
    text?: string
    type?: 'button' | 'submit'
    size?: 'small' | 'default' | 'large' | 'x-large'
    block?: boolean
    width?: string
    height?: string
    loading?: boolean
    disabled?: boolean
    ariaLabel?: string
    appendIcon?: string
    prependIcon?: string
    target?: '_blank'
    // Custom Options:
    styling?: 'primary' | 'secondary' | 'text'
  }>(),
  {
    to: undefined,
    text: 'Button',
    type: 'button',
    size: 'default',
    width: undefined,
    height: undefined,
    ariaLabel: undefined,
    appendIcon: undefined,
    prependIcon: undefined,
    target: undefined,
    // Custom Options:
    styling: 'primary',
  }
)

const isExternalLink = computed(() => props.to?.startsWith('http') ?? false)
const variant = computed(() => {
  if (props.styling === 'secondary') return 'outlined' as const
  if (props.styling === 'text') return 'text' as const
  return 'flat' as const
})
</script>

<template>
  <VBtn
    :to="isExternalLink ? undefined : to"
    :href="isExternalLink ? to : undefined"
    :type="type"
    :size="size"
    :block="block"
    :width="width"
    :height="height"
    :loading="loading"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :append-icon="appendIcon"
    :prepend-icon="prependIcon"
    :target="target"
    :title="ariaLabel ?? text"
    :variant="variant"
    color="primary"
    class="base-button"
    :class="`is-${styling}`"
    @click="emit('click')"
  >
    {{ text }}
  </VBtn>
</template>

<style lang="scss" scoped>
.base-button {
  @include body1-bold;
  border-radius: var(--border-radius-s);
  transition: var(--transition-slow);
  text-transform: none;
  letter-spacing: normal;
}

// legacy .btnPrimary：黃底黑字，hover 反轉成黑底白字
.is-primary {
  color: var(--secondary);

  @include hover {
    &:hover {
      color: var(--white);
      background-color: var(--secondary) !important;
    }
  }
}

// legacy .btnSecondary：白底黃框，hover 填滿黃色
.is-secondary {
  color: var(--font);

  @include hover {
    &:hover {
      background-color: var(--primary) !important;
    }
  }
}

.is-text {
  color: var(--font);
}
</style>
