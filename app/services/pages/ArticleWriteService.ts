import { useRuntimeConfig } from 'nuxt/app'
import { saveArticleRequestSchema } from '@/types/api/dto/article.dto'
import type { ArticleDto } from '@/types/api/dto/article.dto'

/**
 * 文章寫入。
 *
 * ⚠ **目前只把資料印到 console，不會真的送出。**
 *
 * 原因：純靜態網站要送出寫入請求，就必須把 API 金鑰放進瀏覽器——
 * 那等於公開它。詳見 docs/gas-setup.md 的「重要限制」。
 * GAS 端的 `doPost` 已經寫好了，缺的只是一個能安全保管金鑰的地方。
 *
 * 之後搬到有後端的環境時，**只要改這個檔案的 `save()`**：
 * 把 console.log 換成 `$fetch(url, { method: 'POST', body, headers })`，
 * 表單元件與 DTO 都不用動。
 */
export class ArticleWriteService {
  private get apiUrl(): string {
    return String(useRuntimeConfig().public.gasApiUrl || '')
  }

  /**
   * 儲存一篇文章。
   *
   * 回傳驗證結果而不是直接 throw——表單要把錯誤顯示在對應欄位旁邊，
   * 不是整頁崩掉。
   */
  async save(article: ArticleDto): Promise<
    { ok: true; payload: unknown } | { ok: false; errors: { path: string; message: string }[] }
  > {
    // 送出前用 DTO schema 驗一次。這份規則之後接真後端時原封不動沿用
    const parsed = saveArticleRequestSchema.safeParse({ article })

    if (!parsed.success) {
      return {
        ok: false,
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      }
    }

    const payload = parsed.data

    // ── 這裡就是之後要換掉的地方 ──────────────────────────
    // 真後端版本大概長這樣：
    //
    //   return $fetch(`${this.apiUrl}/articles/${article.week}`, {
    //     method: 'POST',
    //     body: payload,
    //     headers: { Authorization: `Bearer ${session.token}` },
    //   })
    //
    // GAS 版本則是 POST 到 apiUrl，body 加上 apiKey——但金鑰會外洩，所以沒接。
    console.groupCollapsed(
      `%c[ArticleWriteService] 送出文章 week ${article.week}（示範：只印出，未實際送出）`,
      'color:#000;background:#ffe60f;padding:2px 6px;border-radius:3px'
    )
    console.log('目標端點：', this.apiUrl || '(未設定 NUXT_PUBLIC_GAS_API_URL)')
    console.log('通過 DTO 驗證的 payload：')
    console.log(JSON.stringify(payload, null, 2))
    console.log('原始物件（方便展開檢視）：', payload)
    console.groupEnd()
    // ──────────────────────────────────────────────────

    return { ok: true, payload }
  }
}

export const articleWriteService = new ArticleWriteService()
