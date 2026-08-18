<script lang="ts" setup>
import BaseButton from '@/components/common/button/BaseButton.vue'
import BaseIconButton from '@/components/common/button/BaseIconButton.vue'

// 一般不直接用，透過 useDialog().openDialog() 開啟。
const emit = defineEmits<{ (e: 'confirm' | 'cancel'): void }>()
withDefaults(
  defineProps<{
    title?: string
    ariaLabel?: string
    text?: string
    emphasizedText?: string
    type?: 'cancel' | 'save'
    width?: string
    maxWidth?: string
    persistent?: boolean
    closeButton?: boolean
    cancelText?: string
    confirmText?: string
    defaultButtons?: boolean
  }>(),
  {
    title: undefined,
    ariaLabel: undefined,
    text: undefined,
    emphasizedText: undefined,
    type: 'save',
    width: 'auto',
    maxWidth: '480px',
    closeButton: true,
    cancelText: '取消',
    confirmText: '確定',
    defaultButtons: true,
  }
)

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <VDialog
    v-model="model"
    :width="width"
    :max-width="maxWidth"
    :persistent="persistent"
    :aria-label="ariaLabel ?? title"
    class="base-dialog"
  >
    <VCard class="base-dialog__card">
      <header class="base-dialog__header">
        <h2 v-if="title" class="base-dialog__title">{{ title }}</h2>
        <BaseIconButton
          v-if="closeButton"
          icon="mdi:close"
          label="關閉對話框"
          size="small"
          @click="emit('cancel')"
        />
      </header>

      <div class="base-dialog__body">
        <slot>
          <p v-if="text">
            {{ text }}
            <strong v-if="emphasizedText" class="base-dialog__emphasized">{{ emphasizedText }}</strong>
          </p>
        </slot>
      </div>

      <footer v-if="defaultButtons || $slots.footer" class="base-dialog__footer">
        <slot name="footer">
          <BaseButton :text="cancelText" styling="secondary" @click="emit('cancel')" />
          <BaseButton
            :text="confirmText"
            :styling="type === 'cancel' ? 'secondary' : 'primary'"
            @click="emit('confirm')"
          />
        </slot>
      </footer>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.base-dialog {
  &__card {
    padding: 20px;
    border-radius: var(--border-radius-m);
    background-color: var(--surface);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  &__title {
    @include subtitle1-bold;
    color: var(--title);
  }

  &__body {
    @include body1-regular;
    padding: 16px 0;
    color: var(--font);
  }

  &__emphasized {
    color: var(--red1);
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
