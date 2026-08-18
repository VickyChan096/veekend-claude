<script lang="ts" setup>
withDefaults(
  defineProps<{
    size?: number
    width?: number
    /** 置中並撐出高度，用於區塊載入 */
    block?: boolean
    text?: string
  }>(),
  {
    size: 32,
    width: 3,
    text: undefined,
  }
)
</script>

<template>
  <div class="base-loading" :class="{ 'is-block': block }" role="status" aria-live="polite">
    <VProgressCircular :size="size" :width="width" color="primary" indeterminate />
    <span v-if="text" class="base-loading__text">{{ text }}</span>
    <span v-else class="sr-only">載入中</span>
  </div>
</template>

<style lang="scss" scoped>
.base-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &.is-block {
    min-height: 200px;
  }

  &__text {
    @include body2-regular;
    color: var(--subtitle);
  }
}
</style>
