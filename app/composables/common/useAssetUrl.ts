import { useRuntimeConfig } from 'nuxt/app'

/**
 * 資源路徑的兩種形式。
 *
 * `assetUrl`  → 補上 app.baseURL，給頁面內的 <img>、背景圖用
 * `absoluteUrl` → 再補上站台網域，給 og:image、og:url 這類**社群平台會抓的**欄位用
 *
 * Nuxt 只會自動處理 /_nuxt/ 的資源與 router 連結，`<img src="/images/x.jpg">`
 * 這種直接寫死的路徑不會被改寫——部署到 GitHub Pages 子路徑時就會 404。
 * 資料裡帶路徑的圖片（例如 db.json 的 largeCoverUrl）一律走這裡。
 */
export const useAssetUrl = () => {
  const config = useRuntimeConfig()
  const baseURL = config.app.baseURL
  const siteUrl = String(config.public.siteUrl || '')

  const assetUrl = (path: string): string => {
    // 空字串代表站台根目錄，要回 baseURL 而不是空值
    // ——否則 absoluteUrl('') 會組出少了子路徑的網址
    if (!path) return baseURL
    if (/^(https?:)?\/\//.test(path)) return path
    return `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  }

  /**
   * 補上網域的完整網址。Facebook、LINE、Twitter 抓 og:image 時不接受相對路徑，
   * 沒有絕對網址分享出去就不會有預覽圖。
   * 本機沒設 siteUrl 時退回相對路徑（開發時看不到分享預覽也無所謂）。
   */
  const absoluteUrl = (path: string): string => {
    const relative = assetUrl(path)
    if (!siteUrl) return relative
    if (/^https?:\/\//.test(relative)) return relative
    return `${siteUrl.replace(/\/$/, '')}${relative.startsWith('/') ? '' : '/'}${relative}`
  }

  return { assetUrl, absoluteUrl }
}
