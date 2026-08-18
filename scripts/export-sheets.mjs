/**
 * 把 app/assets/data/articles.json 轉成四份 CSV，給 Google Sheets 匯入。
 *
 *   輸出到 scripts/sheets-export/
 *     articles.csv      一列一篇
 *     destinations.csv  一列一個景點
 *     blocks.csv        一列一個內文區塊
 *     parts.csv         一列一個區塊內的元素
 *
 * 設計取捨：
 * - catalog 區塊不存——它可以從「有 anchorId 的 section 的 h4 標題」推導出來
 *   （legacy 只有 week1 不一致，且是原始資料的錯字）
 * - searchText 不存——build 時由 parts 重新攤平
 * - destinations 的 local[緯度, 經度] 拆成 lat / lng 兩欄，Sheets 裡才看得懂
 * - hashTags 用逗號分隔塞同一格（每篇只有 1~6 個，開獨立表是過度設計）
 * - list 的多個項目用儲存格內換行分隔（Sheets 按 Alt+Enter 就能編）
 *
 * 執行：npm run sheets:export
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const SOURCE = resolve(here, '../app/assets/data/articles.json')
const OUT_DIR = resolve(here, 'sheets-export')

/** CSV 逃逸：含逗號、引號或換行就整格加引號，內部引號成對 */
const csvCell = (value) => {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const toCsv = (headers, rows) =>
  [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'

/** UTF-8 BOM。Google Sheets 匯入時沒有它中文會變亂碼 */
const BOM = '\uFEFF'

const { articles } = JSON.parse(readFileSync(SOURCE, 'utf8'))

// ── articles ────────────────────────────────────────────────
const ARTICLE_HEADERS = [
  'week',
  'title',
  'city',
  'district',
  'visitedDate',
  'writtenDate',
  'userName',
  'briefing',
  'largeCoverUrl',
  'smallCoverUrl',
  'hashTags',
  'published',
]

const articleRows = articles.map((article) => [
  article.week,
  article.title,
  article.city,
  article.district,
  article.visitedDate,
  article.writtenDate,
  article.userName,
  article.briefing,
  article.largeCoverUrl,
  article.smallCoverUrl,
  article.hashTags.join(','),
  // 一律 TRUE。published 是給「寫到一半不想公開」的草稿用的，
  // 不要拿「內文是空的」當判斷——legacy 的 week7~12 就是刻意展示的未完成頁，
  // 標題「未完成」、摘要「努力趕稿中」都是設計的一部分。
  'TRUE',
])

// ── destinations ────────────────────────────────────────────
const DESTINATION_HEADERS = ['week', 'order', 'name', 'rate', 'mapUrl', 'lat', 'lng']

const destinationRows = articles.flatMap((article) =>
  article.destinations.map((destination, index) => [
    article.week,
    index + 1,
    destination.name,
    destination.rate,
    destination.mapUrl,
    destination.local[0],
    destination.local[1],
  ])
)

// ── blocks / parts ──────────────────────────────────────────
const BLOCK_HEADERS = ['week', 'order', 'type', 'layout', 'anchorId']
const PART_HEADERS = [
  'week',
  'blockOrder',
  'order',
  'kind',
  'level',
  'heading',
  'text',
  'imageSrc',
  'imageFullSrc',
  'imageAlt',
  'imageCaption',
]

const blockRows = []
const partRows = []

articles.forEach((article) => {
  // catalog 可推導，不匯出
  const stored = article.blocks.filter((block) => block.type !== 'catalog')

  stored.forEach((block, blockIndex) => {
    const blockOrder = blockIndex + 1
    blockRows.push([
      article.week,
      blockOrder,
      block.type,
      block.type === 'section' ? block.layout : '',
      block.type === 'section' ? (block.anchorId ?? '') : '',
    ])

    const pushPart = (order, part) => {
      partRows.push([
        article.week,
        blockOrder,
        order,
        part.kind,
        part.level ?? '',
        part.heading ?? '',
        part.text ?? '',
        part.imageSrc ?? '',
        part.imageFullSrc ?? '',
        part.imageAlt ?? '',
        part.imageCaption ?? '',
      ])
    }

    if (block.type === 'gallery') {
      block.items.forEach((item, index) => {
        pushPart(index + 1, {
          kind: 'galleryItem',
          heading: item.heading,
          text: item.html,
          imageSrc: item.image.src,
          imageFullSrc: item.image.fullSrc,
          imageAlt: item.image.alt,
          imageCaption: item.image.caption,
        })
      })
      return
    }

    block.parts.forEach((part, index) => {
      const order = index + 1
      switch (part.kind) {
        case 'heading':
          pushPart(order, { kind: 'heading', level: part.level, text: part.text })
          break
        case 'list':
          // 多個項目用儲存格內換行分隔
          pushPart(order, { kind: 'list', text: part.items.join('\n') })
          break
        case 'paragraph':
          pushPart(order, { kind: 'paragraph', text: part.html })
          break
        case 'image':
          pushPart(order, {
            kind: 'image',
            imageSrc: part.image.src,
            imageFullSrc: part.image.fullSrc,
            imageAlt: part.image.alt,
            imageCaption: part.image.caption,
          })
          break
        case 'imageText':
          pushPart(order, {
            kind: 'imageText',
            text: part.html,
            imageSrc: part.image.src,
            imageFullSrc: part.image.fullSrc,
            imageAlt: part.image.alt,
            imageCaption: part.image.caption,
          })
          break
        case 'video':
          pushPart(order, { kind: 'video', text: part.src })
          break
      }
    })
  })
})

mkdirSync(OUT_DIR, { recursive: true })

const files = [
  ['articles.csv', toCsv(ARTICLE_HEADERS, articleRows)],
  ['destinations.csv', toCsv(DESTINATION_HEADERS, destinationRows)],
  ['blocks.csv', toCsv(BLOCK_HEADERS, blockRows)],
  ['parts.csv', toCsv(PART_HEADERS, partRows)],
]

files.forEach(([name, content]) => {
  // 加 BOM，Google Sheets 匯入才不會把中文變亂碼
  writeFileSync(join(OUT_DIR, name), BOM + content, 'utf8')
})

console.log('已輸出到', OUT_DIR)
console.log(`  articles.csv     ${articleRows.length} 列`)
console.log(`  destinations.csv ${destinationRows.length} 列`)
console.log(`  blocks.csv       ${blockRows.length} 列`)
console.log(`  parts.csv        ${partRows.length} 列`)
