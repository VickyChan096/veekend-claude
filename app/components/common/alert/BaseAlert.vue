<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

// 取代 legacy 的 SweetAlert（js/common.js 的 errAlert）。
// 一般不直接用，透過 useAlert().openAlert() 開啟。
const emit = defineEmits<{ (e: 'close-event'): void }>()
const props = withDefaults(
  defineProps<{
    title?: string
    text?: string
    closable?: boolean
    icon?: string
    type?: 'success' | 'info' | 'error'
    /** 三秒後自動關閉 */
    timer?: boolean
  }>(),
  {
    title: undefined,
    text: undefined,
    closable: true,
    icon: undefined,
    type: 'info',
  }
)

const model = defineModel<boolean>({ default: true })
let timerId: ReturnType<typeof setTimeout> | null = null

const iconName = computed(() => {
  if (props.icon) return props.icon
  if (props.type === 'success') return 'mdi:check-circle-outline'
  if (props.type === 'error') return 'mdi:alert-circle-outline'
  return 'mdi:information-outline'
})

const close = () => {
  model.value = false
  emit('close-event')
}

onMounted(() => {
  if (props.timer) timerId = setTimeout(close, 3000)
})
onBeforeUnmount(() => {
  if (timerId) clearTimeout(timerId)
})
</script>

<template>
  <VSnackbar
    v-model="model"
    :timeout="-1"
    location="top"
    class="base-alert"
    :class="`is-${type}`"
    role="alert"
  >
    <div class="base-alert__body">
      <Icon :name="iconName" class="base-alert__icon" />
      <div class="base-alert__text">
        <p v-if="title" class="base-alert__title">{{ title }}</p>
        <p v-if="text">{{ text }}</p>
      </div>
    </div>
    <template v-if="closable" #actions>
      <VBtn variant="text" aria-label="關閉提示" title="關閉提示" icon @click="close">
        <Icon name="mdi:close" />
      </VBtn>
    </template>
  </VSnackbar>
</template>

<style lang="scss" scoped>
.base-alert {
  &__body {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  &__icon {
    flex: 0 0 auto;
    margin-top: 2px;
    font-size: 1.25rem;
  }
  &__title {
    @include body1-bold;
  }
  &__text {
    @include body2-regular;
  }
}
.is-success :deep(.v-snackbar__wrapper) {
  border-left: 4px solid var(--green1);
}
.is-error :deep(.v-snackbar__wrapper) {
  border-left: 4px solid var(--red1);
}
.is-info :deep(.v-snackbar__wrapper) {
  border-left: 4px solid var(--primary);
}
</style>
