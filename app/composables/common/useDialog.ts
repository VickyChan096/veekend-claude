import { computed, ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import type { Dialog } from '@/types/common/dialog/DialogOption'

const createDialogStore = () => {
  const state = ref<{ dialogs: Dialog[] }>({ dialogs: [] })
  let seq = 0

  const openDialog = (dialog: Omit<Dialog, 'id'>) => {
    const id = `dialog-${(seq += 1)}`
    state.value.dialogs.push({
      id,
      ...dialog,
      modelValue: dialog.modelValue ?? true,
    })
  }

  const closeDialog = (id: string) => {
    const index = state.value.dialogs.findIndex((dialog) => dialog.id === id)
    if (index !== -1) state.value.dialogs.splice(index, 1)
  }

  return {
    dialogs: computed(() => state.value.dialogs),
    openDialog,
    closeDialog,
  }
}

type DialogStore = ReturnType<typeof createDialogStore>

export const useDialog = (): DialogStore => {
  const store = useNuxtApp().$dialogStore as DialogStore
  if (!store) throw new Error('Dialog store not found')
  return store
}

export { createDialogStore }
