import { defineNuxtPlugin } from 'nuxt/app'
import { createAlertStore } from '@/composables/common/useAlert'
import { createDialogStore } from '@/composables/common/useDialog'
import { createFetchLoadingStore } from '@/composables/common/useFetchLoading'
import { createThemeStore } from '@/composables/common/useThemeMode'

export default defineNuxtPlugin((nuxtApp) => {
  const themeStore = createThemeStore()

  nuxtApp.provide('alertStore', createAlertStore())
  nuxtApp.provide('dialogStore', createDialogStore())
  nuxtApp.provide('fetchLoadingStore', createFetchLoadingStore())
  nuxtApp.provide('themeStore', themeStore)

  // SSG 產出的 HTML 一律是淺色，掛載後才還原使用者的選擇
  if (import.meta.client) {
    nuxtApp.hook('app:mounted', () => themeStore.restore())
  }
})
