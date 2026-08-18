import { useRuntimeConfig } from 'nuxt/app'

/**
 * 對外請求的共同基底。所有 GAS 呼叫都要走 services，元件不直接打 API。
 *
 * 讀取：在 build 時靜態化（頁面用 useAsyncData 包），內容更新＝重新部署。
 * 寫入：client 端直接 POST 到 GAS（純靜態站沒有自己的 server）。
 */
export default abstract class ServiceBase {
  protected get apiUrl(): string {
    const url = useRuntimeConfig().public.gasApiUrl
    if (!url) {
      throw new Error('未設定 NUXT_PUBLIC_GAS_API_URL，請參考 .env.example')
    }
    return url
  }

  protected async get<T>(params: Record<string, string> = {}): Promise<T> {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(query ? `${this.apiUrl}?${query}` : this.apiUrl)
    if (!res.ok) {
      throw new Error(`GAS 讀取失敗：${res.status}`)
    }
    return res.json() as Promise<T>
  }

  protected async post<T>(body: unknown): Promise<T> {
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      // GAS web app 對 application/json 會觸發 preflight，用 text/plain 規避
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      throw new Error(`GAS 寫入失敗：${res.status}`)
    }
    return res.json() as Promise<T>
  }
}
