/**
 * 文章內文的結構化模型。
 *
 * legacy 把整篇內文以一大塊 HTML 存在 db.json 的 `content` 欄位，用 innerHTML 塞進頁面。
 * 這裡改成先解析成區塊資料（`scripts/parse-articles.mjs`），再用 Vue 元件渲染，
 * 只有段落與清單項目保留行內 HTML（`<a>`／`<u>`／`<mark>`／`<br>`）。
 *
 * 產出檔：app/assets/data/articles.json（由腳本產生，不要手改）
 */

/** 只含行內標籤的片段，需要 v-html 才能保留 <a>／<u>／<mark> 等標記 */
export type InlineHtml = string

export interface ArticleImage {
  /** 縮圖／版面上顯示的圖 */
  src: string
  alt?: string
  /** 燈箱要開的大圖。legacy 只有 7 張有，其餘沿用 src */
  fullSrc: string
  /** legacy 的 data-caption */
  caption?: string
}

/** 區塊內的元素，維持原始順序 */
export type ArticlePart =
  | { kind: 'heading'; level: 4 | 5 | 6; text: string }
  | { kind: 'list'; items: InlineHtml[] }
  | { kind: 'paragraph'; html: InlineHtml }
  | { kind: 'image'; image: ArticleImage }
  /** 圖片上方疊一條半透明黑底說明（legacy 的 .imgText） */
  | { kind: 'imageText'; html: InlineHtml; image: ArticleImage }
  | { kind: 'video'; src: string }

/**
 * 版面。對應 legacy 的 articleStyle1~6：
 * - imageLeft／imageRight：景點卡，圖文各半
 * - imageFirst／textFirst：全寬圖 + 文字
 * - video：影片區塊
 */
export type SectionLayout = 'imageLeft' | 'imageRight' | 'imageFirst' | 'textFirst' | 'video'

export interface CatalogItem {
  /** 錨點 id，例如 dest1 */
  anchor: string
  text: string
}

export interface GalleryItem {
  image: ArticleImage
  heading?: string
  html?: InlineHtml
}

export type ArticleBlock =
  | { type: 'catalog'; label: string; items: CatalogItem[] }
  | { type: 'section'; layout: SectionLayout; anchorId?: string; parts: ArticlePart[] }
  /** legacy 的 articleStyle5：三欄圖文 */
  | { type: 'gallery'; items: GalleryItem[] }

/** 解析後的文章。blocks 由腳本產生，其餘欄位與 db.json 相同 */
export interface ArticleContent {
  week: number
  blocks: ArticleBlock[]
}
