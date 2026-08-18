import { computed, ref, watch } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { useTheme } from 'vuetify'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'veekend-theme'

// 深色模式。同時切換 Vuetify 主題與 <html data-theme>，
// 前者管 Vuetify 元件，後者管 _theme.scss 的 CSS 變數。
const createThemeStore = () => {
  const mode = ref<ThemeMode>('light')

  const apply = (value: ThemeMode) => {
    if (import.meta.client) {
      document.documentElement.dataset.theme = value
      localStorage.setItem(STORAGE_KEY, value)
    }
  }

  const setMode = (value: ThemeMode) => {
    mode.value = value
  }
  const toggle = () => setMode(mode.value === 'light' ? 'dark' : 'light')

  /** 由 plugin 在 client 掛載後呼叫，讀回使用者上次的選擇 */
  const restore = () => {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') {
      mode.value = saved
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      mode.value = 'dark'
    }
    apply(mode.value)
  }

  watch(mode, apply)

  return {
    mode: computed(() => mode.value),
    isDark: computed(() => mode.value === 'dark'),
    setMode,
    toggle,
    restore,
  }
}

type ThemeStore = ReturnType<typeof createThemeStore>

export const useThemeMode = () => {
  const store = useNuxtApp().$themeStore as ThemeStore
  if (!store) throw new Error('Theme store not found')

  // 把切換同步給 Vuetify
  const vuetifyTheme = useTheme()
  watch(
    store.mode,
    (value) => {
      vuetifyTheme.change(value === 'dark' ? 'veekendDark' : 'veekend')
    },
    { immediate: true }
  )

  return store
}

export { createThemeStore }
