<script lang="ts" setup>
import { useFetchLoading } from '@/composables/common/useFetchLoading'

// 全域請求遮罩。掛在 GlobalComponents，由 useFetchLoading() 控制。
const { isLoading } = useFetchLoading()
</script>

<template>
  <Transition name="fade">
    <div v-if="isLoading" class="fetch-loading" role="status" aria-live="polite">
      <VProgressCircular :size="48" :width="4" color="primary" indeterminate />
      <span class="sr-only">載入中</span>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.fetch-loading {
  position: fixed;
  inset: 0;
  z-index: var(--z-fetch-loading);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(0 0 0 / 40%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
