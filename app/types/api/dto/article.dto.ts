import { z } from 'zod'

/**
 * 文章的 API 契約（DTO）。
 *
 * 這一層刻意與 `app/types/api/article.ts` 的 domain 型別分開：
 * - domain 型別描述「畫面要用的資料形狀」
 * - DTO 描述「跟後端往來的資料形狀」
 *
 * 現在兩者幾乎一樣（因為後端就是照 domain 設計的），但分開之後
 * 換後端時只需要改 DTO 與轉換函式，畫面元件完全不用動。
 *
 * 用 zod 定義，型別由 schema 推導出來——**驗證與型別同一份來源**，
 * 不會出現「型別說是 number、實際傳了 string」這種對不上的情況。
 */

// ─────────────────────────────────────────────────────────────
// 內文元素
// ─────────────────────────────────────────────────────────────

/** 版面。對應 legacy 的 articleStyle1~6 */
export const sectionLayoutSchema = z.enum([
  'imageLeft',
  'imageRight',
  'imageFirst',
  'textFirst',
  'video',
])

export const imageDtoSchema = z.object({
  /** 相對於 public/ 的路徑，例如 images/week1/cover.jpg */
  src: z.string().min(1, '圖片路徑必填'),
  alt: z.string().optional(),
  /** 燈箱要開的大圖，留空就用 src */
  fullSrc: z.string().optional(),
  caption: z.string().optional(),
})

/** 內文元素。7 種 kind 各自需要的欄位不同，用 discriminated union 分開 */
export const partDtoSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('heading'),
    /** 4 景點名、5 小標、6 評分 */
    level: z.union([z.literal(4), z.literal(5), z.literal(6)]),
    text: z.string().min(1, '標題不能空白'),
  }),
  z.object({
    kind: z.literal('list'),
    items: z.array(z.string().min(1)).min(1, '清單至少要一個項目'),
  }),
  z.object({
    kind: z.literal('paragraph'),
    /** 可含行內 HTML：<a> <u> <mark> <br> */
    html: z.string().min(1, '段落不能空白'),
  }),
  z.object({
    kind: z.literal('image'),
    image: imageDtoSchema,
  }),
  z.object({
    kind: z.literal('imageText'),
    /** 疊在圖片上方的說明 */
    html: z.string(),
    image: imageDtoSchema,
  }),
  z.object({
    kind: z.literal('video'),
    /** YouTube 嵌入網址 */
    src: z.string().url('請填完整的影片網址'),
  }),
])

export const galleryItemDtoSchema = z.object({
  image: imageDtoSchema,
  heading: z.string().optional(),
  html: z.string().optional(),
})

// ─────────────────────────────────────────────────────────────
// 內文區塊
// ─────────────────────────────────────────────────────────────

/**
 * 目錄（catalog）刻意不在 DTO 裡——它是從「有 anchorId 的 section 的 h4 標題」
 * 推導出來的，不該由前端送出。詳見 CLAUDE.md 的資料層段落。
 */
export const blockDtoSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('section'),
    layout: sectionLayoutSchema,
    /** 填了就會出現在文章開頭的目錄裡，例如 dest1 */
    anchorId: z.string().optional(),
    parts: z.array(partDtoSchema).min(1, '區塊至少要一個元素'),
  }),
  z.object({
    type: z.literal('gallery'),
    items: z.array(galleryItemDtoSchema).min(1, '三欄圖文至少要一欄'),
  }),
])

// ─────────────────────────────────────────────────────────────
// 景點
// ─────────────────────────────────────────────────────────────

export const destinationDtoSchema = z.object({
  name: z.string().min(1, '景點名稱必填'),
  rate: z.number().min(0, '評分不能小於 0').max(5, '評分不能大於 5'),
  mapUrl: z.string().url('請填完整的地圖網址'),
  /** 緯度。台灣本島約在 21.9 ~ 25.3 之間 */
  lat: z.number().min(-90).max(90),
  /** 經度。台灣本島約在 120.0 ~ 122.0 之間 */
  lng: z.number().min(-180).max(180),
})

// ─────────────────────────────────────────────────────────────
// 文章
// ─────────────────────────────────────────────────────────────

/** legacy 的日期格式是 2019.10.20，允許 2022.12.?? 這種不完整值 */
const dotDateSchema = z
  .string()
  .regex(/^\d{4}\.\d{2}\.(\d{2}|\?\?)$/, '日期格式要像 2019.10.20')

export const articleDtoSchema = z.object({
  /** 主鍵，也是網址 /article/1 */
  week: z.number().int().positive('週次要是正整數'),
  title: z.string().min(1, '標題必填'),
  city: z.string().min(1, '縣市必填'),
  district: z.string().min(1, '區域必填'),
  visitedDate: dotDateSchema,
  writtenDate: dotDateSchema,
  userName: z.string().min(1, '作者必填'),
  briefing: z.string().min(1, '摘要必填'),
  largeCoverUrl: z.string().min(1, '封面圖必填'),
  smallCoverUrl: z.string().min(1, '側欄小圖必填'),
  hashTags: z.array(z.string().min(1)),
  /** false 的文章不會出現在網站上。未完成但仍要展示的要填 true */
  published: z.boolean(),
  destinations: z.array(destinationDtoSchema),
  blocks: z.array(blockDtoSchema),
})

/** 送出時的完整請求。之後換真後端時，authorization 改成 header 帶 token */
export const saveArticleRequestSchema = z.object({
  article: articleDtoSchema,
})

// ─────────────────────────────────────────────────────────────
// 型別由 schema 推導，不要另外手寫
// ─────────────────────────────────────────────────────────────

export type SectionLayoutDto = z.infer<typeof sectionLayoutSchema>
export type ImageDto = z.infer<typeof imageDtoSchema>
export type PartDto = z.infer<typeof partDtoSchema>
export type GalleryItemDto = z.infer<typeof galleryItemDtoSchema>
export type BlockDto = z.infer<typeof blockDtoSchema>
export type DestinationDto = z.infer<typeof destinationDtoSchema>
export type ArticleDto = z.infer<typeof articleDtoSchema>
export type SaveArticleRequest = z.infer<typeof saveArticleRequestSchema>

/** part 的種類，給編輯器的下拉選單用 */
export type PartKind = PartDto['kind']

export const PART_KIND_LABELS: Record<PartKind, string> = {
  heading: '標題',
  list: '條列',
  paragraph: '段落',
  image: '圖片',
  imageText: '圖片＋說明',
  video: '影片',
}

export const SECTION_LAYOUT_LABELS: Record<SectionLayoutDto, string> = {
  imageLeft: '圖左文右',
  imageRight: '文左圖右',
  imageFirst: '圖在上、文在下',
  textFirst: '文在上、圖在下',
  video: '影片區塊',
}
