/**
 * 文章資料模型。
 * 來源：legacy-app/dataBase/db.json 的 articles[]（12 筆，欄位已全數掃過確認一致）。
 * GAS 端的 Sheets 欄位需與此對齊；若 GAS 回傳格式不同，在 services 層轉換，不要污染這裡。
 */

/** 一篇文章裡的單一景點 */
export interface Destination {
  name: string
  /** Google 評分，例如 3.9 */
  rate: number
  /** Google Maps 短網址 */
  mapUrl: string
  /** [緯度, 經度]——注意順序與 MapLibre 的 [lng, lat] 相反，在 services 層轉換 */
  local: [number, number]
}

export interface Article {
  id: number
  userName: string
  /** 第幾週 */
  week: number
  city: string
  district: string
  /** 造訪日期，legacy 格式為 "2019.10.20" 字串 */
  visitedDate: string
  /** 撰寫日期，legacy 有 "2022.12.??" 這種不完整值，不可直接當日期解析 */
  writtenDate: string
  title: string
  /** 列表頁的摘要 */
  briefing: string
  largeCoverUrl: string
  smallCoverUrl: string
  destinations: Destination[]
  hashTags: string[]
  /** 內文 HTML，可能為空字串（未完成的文章） */
  content: string
}
