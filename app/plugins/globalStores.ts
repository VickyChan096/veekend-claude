import { defineNuxtPlugin } from 'nuxt/app'
import { createAlertStore } from '@/composables/common/useAlert'
import { createDialogStore } from '@/composables/common/useDialog'
import { createFetchLoadingStore } from '@/composables/common/useFetchLoading'
import { createThemeStore } from '@/composables/common/useThemeMode'
import { createAuthStore } from '@/composables/common/useAuth'

export default defineNuxtPlugin((nuxtApp) => {
  const themeStore = createThemeStore()
  const authStore = createAuthStore()

  nuxtApp.provide('alertStore', createAlertStore())
  nuxtApp.provide('dialogStore', createDialogStore())
  nuxtApp.provide('fetchLoadingStore', createFetchLoadingStore())
  nuxtApp.provide('themeStore', themeStore)
  nuxtApp.provide('authStore', authStore)

  // SSG 產出的 HTML 一律是淺色，掛載後才還原使用者的選擇
  if (import.meta.client) {
    nuxtApp.hook('app:mounted', () => {
      themeStore.restore()
      authStore.restore()
    })
  }
})
