import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuth } from '@/composables/common/useAuth'

/**
 * 需要登入才能進的路徑。
 *
 * 用全域 middleware + 路徑清單，而不是各頁寫 `definePageMeta({ middleware })`
 * ——因為 `imports.autoImport: false` 之下 `definePageMeta` 這個巨集
 * TypeScript 認不得。集中在這裡也比較容易一眼看出哪些頁面受保護。
 */
const PROTECTED_PREFIXES = ['/article/edit']

/**
 * ⚠ 只在 client 端檢查。這是純靜態網站，**沒有伺服器可以擋**——
 *   任何人改 localStorage 都能進來。詳見 useAuth 的說明。
 *   之後接真後端時，server 端要再擋一次。
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => to.path === prefix || to.path.startsWith(`${prefix}/`)
  )
  if (!needsAuth) return

  const { isLoggedIn } = useAuth()
  if (isLoggedIn.value) return

  return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
})
