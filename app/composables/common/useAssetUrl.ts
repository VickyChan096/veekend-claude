import { useRuntimeConfig } from 'nuxt/app'

/**
 * 把 public/ 底下的資源路徑補上 app.baseURL。
 *
 * Nuxt 只會自動處理 /_nuxt/ 的資源與 router 連結，`<img src="/images/x.jpg">`
 * 這種直接寫死的路徑不會被改寫——部署到 GitHub Pages 子路徑時就會 404。
 * 資料裡帶路徑的圖片（例如 db.json 的 largeCoverUrl）一律走這個函式。
 */
export const useAssetUrl = () => {
  const baseURL = useRuntimeConfig().app.baseURL

  return (path: string): string => {
    if (!path) return ''
    if (/^(https?:)?\/\//.test(path)) return path
    return `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  }
}
