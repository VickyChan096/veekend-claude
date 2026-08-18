import { computed, ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import type { Alert } from '@/types/common/alert/AlertOption'

// store 由 plugins/globalStores.ts 建立並 provide，確保整個 app 共用同一份狀態。
const createAlertStore = () => {
  const state = ref<{ alerts: Alert[] }>({ alerts: [] })
  let seq = 0

  const closeAlert = (id: string) => {
    const index = state.value.alerts.findIndex((alert) => alert.id === id)
    if (index !== -1) state.value.alerts.splice(index, 1)
  }

  const openAlert = (alert: Omit<Alert, 'id'>): Promise<void> => {
    return new Promise((resolve) => {
      // 不用 Date.now()/Math.random()，避免 SSR 與 client 產生不同的 key
      const id = `alert-${(seq += 1)}`
      state.value.alerts.push({
        id,
        ...alert,
        modelValue: alert.modelValue ?? true,
        onCloseEvent: () => {
          closeAlert(id)
          resolve()
        },
      })
    })
  }

  return {
    alerts: computed(() => state.value.alerts),
    openAlert,
    closeAlert,
  }
}

type AlertStore = ReturnType<typeof createAlertStore>

export const useAlert = (): AlertStore => {
  const store = useNuxtApp().$alertStore as AlertStore
  if (!store) throw new Error('Alert store not found')
  return store
}

export { createAlertStore }
