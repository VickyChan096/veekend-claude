import { computed, ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import type { LoginRequest, Session } from '@/types/api/dto/auth.dto'

/**
 * 登入狀態。
 *
 * ⚠ **這是假驗證。** 帳密比對在瀏覽器裡跑，任何人打開開發者工具都能繞過。
 *   純靜態網站做不到真正的身分驗證——沒有你控制的伺服器可以放判斷邏輯。
 *   詳見 CLAUDE.md 的「登入與編輯」段落。
 *
 * 之所以還是把介面寫得像真的（token、過期時間、restore），是為了讓之後搬到
 * 有後端的環境時，**只要換掉這個檔案裡的 `login()` 與 `restore()`**，
 * 畫面、middleware、表單都不用動。
 *
 * 換真後端時要改的地方：
 * 1. `login()` 改成 POST /auth/login，拿後端發的 token
 * 2. `restore()` 改成帶 cookie 打 /auth/me，不要再從 localStorage 讀
 * 3. token 改存 HttpOnly cookie（localStorage 會被 XSS 讀走）
 */

/** 假帳密。真後端上線後這兩行直接刪掉 */
const FAKE_ACCOUNT = 'vc'
const FAKE_PASSWORD = 'veekend'

const STORAGE_KEY = 'veekend-session'
/** 假 token 的有效期：8 小時 */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

const createAuthStore = () => {
  const session = ref<Session | null>(null)
  const pending = ref(false)

  const isLoggedIn = computed(() => {
    const value = session.value
    return Boolean(value && value.expiresAt > Date.now())
  })

  const persist = (value: Session | null) => {
    if (!import.meta.client) return
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    else localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * 登入。回傳錯誤訊息字串，成功則回 null。
   * 刻意不 throw——表單要顯示訊息，不是崩掉。
   */
  const login = async (payload: LoginRequest): Promise<string | null> => {
    pending.value = true
    try {
      // 假裝有網路延遲，讓載入狀態看得出來
      await new Promise((resolve) => setTimeout(resolve, 400))

      if (payload.account !== FAKE_ACCOUNT || payload.password !== FAKE_PASSWORD) {
        return '帳號或密碼不正確'
      }

      const value: Session = {
        userName: 'VC',
        token: 'fake-token-for-static-site',
        expiresAt: Date.now() + (payload.remember ? SESSION_TTL_MS * 7 : SESSION_TTL_MS),
      }
      session.value = value
      persist(value)
      return null
    } finally {
      pending.value = false
    }
  }

  const logout = () => {
    session.value = null
    persist(null)
  }

  /** 重新整理後把登入狀態讀回來。換真後端時改成打 /auth/me */
  const restore = () => {
    if (!import.meta.client) return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      // 存進去的東西可能被手動改過或是舊版格式，一律檢查過再用。
      // 這裡刻意不用 zod：useAuth 由全域 plugin 建立，引入 zod 會讓它進到
      // 共用 chunk，每一頁的訪客都要多下載 66KB——但只有編輯頁需要它。
      // 三個欄位手寫檢查就夠，DTO schema 留給表單那層用。
      const value = JSON.parse(raw) as Partial<Session>
      const valid =
        typeof value?.userName === 'string' &&
        typeof value?.token === 'string' &&
        typeof value?.expiresAt === 'number' &&
        value.expiresAt > Date.now()

      if (!valid) {
        persist(null)
        return
      }
      session.value = value as Session
    } catch {
      persist(null)
    }
  }

  return {
    session: computed(() => session.value),
    userName: computed(() => session.value?.userName ?? ''),
    isLoggedIn,
    pending: computed(() => pending.value),
    login,
    logout,
    restore,
  }
}

type AuthStore = ReturnType<typeof createAuthStore>

export const useAuth = (): AuthStore => {
  const store = useNuxtApp().$authStore as AuthStore
  if (!store) throw new Error('Auth store not found')
  return store
}

export { createAuthStore }
