<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// legacy 的 #toTop：捲超過 200px 才淡入
const visible = ref(false)

const onScroll = () => {
  visible.value = window.scrollY > 200
}
const toTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <Transition name="fade">
    <button v-show="visible" type="button" class="to-top" aria-label="回到頁面頂端" @click="toTop">
      <Icon name="mdi:chevron-double-up" />
    </button>
  </Transition>
</template>

<style lang="scss" scoped>
.to-top {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: var(--z-to-top);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  font-size: 2rem;
  color: var(--secondary);
  background-color: var(--primary);
  border: 0;
  border-radius: 50%;

  @include min-mobile {
    right: 8px;
  }

  &:focus-visible {
    outline: var(--focus-visible);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
