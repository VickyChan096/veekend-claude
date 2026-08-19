import { z } from 'zod'

/**
 * 登入的 API 契約。
 *
 * ⚠ 目前是**假驗證**——帳密比對在瀏覽器裡跑，任何人打開開發者工具都能繞過。
 *   純靜態網站做不到真正的身分驗證（沒有你控制的伺服器可以放判斷邏輯）。
 *
 * 這份契約的用途是：之後搬到有後端的環境時，把 `useAuth()` 裡的假實作換成
 * 打真 API 就好，畫面與表單完全不用動。欄位形狀刻意照真實登入 API 設計。
 */

export const loginRequestSchema = z.object({
  account: z.string().min(1, '請輸入帳號'),
  password: z.string().min(1, '請輸入密碼'),
  /** 之後接真後端時對應「延長 token 效期」 */
  remember: z.boolean().default(false),
})

export const sessionSchema = z.object({
  /** 顯示用的名稱 */
  userName: z.string(),
  /**
   * 存取權杖。假實作填固定字串；
   * 之後換真後端就是後端發的 JWT，由 Authorization header 帶出去。
   */
  token: z.string(),
  /** 到期時間（毫秒時間戳）。假實作也照樣給，讓過期邏輯現在就能寫對 */
  expiresAt: z.number(),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>
export type Session = z.infer<typeof sessionSchema>
