/**
 * 把 Sheets 的四張表（articles / destinations / blocks / parts）組回應用程式要的
 * Article[] 結構。GAS 端與本地驗證腳本共用同一份邏輯，避免兩邊組出來的東西不一樣。
 *
 * ⚠ GAS 不支援 ES module import，所以 `gas/Code.gs` 裡有一份等價實作。
 *   改這裡的邏輯時，那邊要一起改——兩邊都有 rebuildArticles() 的註記。
 */

/** 目錄的標題固定這個字；legacy 12 篇全部都是「本週景點」 */
export const CATALOG_LABEL = '本週景點'

const toNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const orEmpty = (value) => (value === null || value === undefined ? '' : String(value))

/** 空字串一律轉成 undefined，讓輸出跟 parser 產生的 JSON 一致 */
const orUndefined = (value) => {
  const text = orEmpty(value).trim()
  return text ? text : undefined
}

const toImage = (part) => ({
  src: orEmpty(part.imageSrc),
  ...(orUndefined(part.imageAlt) ? { alt: orUndefined(part.imageAlt) } : {}),
  fullSrc: orEmpty(part.imageFullSrc) || orEmpty(part.imageSrc),
  ...(orUndefined(part.imageCaption) ? { caption: orUndefined(part.imageCaption) } : {}),
})

const toPart = (row) => {
  switch (row.kind) {
    case 'heading':
      return { kind: 'heading', level: toNumber(row.level), text: orEmpty(row.text) }
    case 'list':
      return {
        kind: 'list',
        // 匯出時用儲存格內換行分隔，這裡切回陣列
        items: orEmpty(row.text)
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
      }
    case 'paragraph':
      return { kind: 'paragraph', html: orEmpty(row.text) }
    case 'image':
      return { kind: 'image', image: toImage(row) }
    case 'imageText':
      return { kind: 'imageText', html: orEmpty(row.text), image: toImage(row) }
    case 'video':
      return { kind: 'video', src: orEmpty(row.text) }
    default:
      return null
  }
}

/** 目錄由「有 anchorId 的 section 的 h4 標題」推導，所以 Sheets 不用存 */
const buildCatalog = (blocks) => {
  const items = blocks
    .filter((block) => block.type === 'section' && block.anchorId)
    .map((block) => {
      const heading = block.parts.find((part) => part.kind === 'heading' && part.level === 4)
      return heading ? { anchor: block.anchorId, text: heading.text } : null
    })
    .filter(Boolean)

  return items.length ? { type: 'catalog', label: CATALOG_LABEL, items } : null
}

/** 把區塊裡的文字攤平成搜尋索引。與 parse-articles.mjs 的 toSearchText 對齊 */
const stripTags = (html) => orEmpty(html).replace(/<[^>]*>/g, ' ')

const buildSearchText = (blocks) => {
  const chunks = []
  const pushImage = (image) => {
    if (image && image.alt) chunks.push(image.alt)
    if (image && image.caption) chunks.push(image.caption)
  }

  blocks.forEach((block) => {
    if (block.type === 'catalog') {
      block.items.forEach((item) => chunks.push(item.text))
      return
    }
    if (block.type === 'gallery') {
      block.items.forEach((item) => {
        if (item.heading) chunks.push(item.heading)
        if (item.html) chunks.push(stripTags(item.html))
        pushImage(item.image)
      })
      return
    }
    block.parts.forEach((part) => {
      if (part.kind === 'heading') chunks.push(part.text)
      else if (part.kind === 'list') part.items.forEach((item) => chunks.push(stripTags(item)))
      else if (part.kind === 'paragraph') chunks.push(stripTags(part.html))
      else if (part.kind === 'imageText') {
        chunks.push(stripTags(part.html))
        pushImage(part.image)
      } else if (part.kind === 'image') pushImage(part.image)
    })
  })

  return chunks.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * @param {object[]} articleRows      articles 表
 * @param {object[]} destinationRows  destinations 表
 * @param {object[]} blockRows        blocks 表
 * @param {object[]} partRows         parts 表
 * @param {{ includeUnpublished?: boolean }} [options]
 */
export function rebuildArticles(articleRows, destinationRows, blockRows, partRows, options) {
  const includeUnpublished = Boolean(options && options.includeUnpublished)

  return articleRows
    .filter((row) => orEmpty(row.week) !== '')
    .map((row) => {
      const week = toNumber(row.week)

      const destinations = destinationRows
        .filter((item) => toNumber(item.week) === week)
        .sort((a, b) => toNumber(a.order) - toNumber(b.order))
        .map((item) => ({
          name: orEmpty(item.name),
          rate: toNumber(item.rate),
          mapUrl: orEmpty(item.mapUrl),
          local: [toNumber(item.lat), toNumber(item.lng)],
        }))

      const stored = blockRows
        .filter((item) => toNumber(item.week) === week)
        .sort((a, b) => toNumber(a.order) - toNumber(b.order))
        .map((item) => {
          const blockOrder = toNumber(item.order)
          const rows = partRows
            .filter(
              (part) => toNumber(part.week) === week && toNumber(part.blockOrder) === blockOrder
            )
            .sort((a, b) => toNumber(a.order) - toNumber(b.order))

          if (item.type === 'gallery') {
            return {
              type: 'gallery',
              items: rows.map((part) => ({
                image: toImage(part),
                ...(orUndefined(part.heading) ? { heading: orUndefined(part.heading) } : {}),
                ...(orUndefined(part.text) ? { html: orUndefined(part.text) } : {}),
              })),
            }
          }

          return {
            type: 'section',
            layout: orEmpty(item.layout),
            ...(orUndefined(item.anchorId) ? { anchorId: orUndefined(item.anchorId) } : {}),
            parts: rows.map(toPart).filter(Boolean),
          }
        })

      const catalog = buildCatalog(stored)
      const blocks = catalog ? [catalog, ...stored] : stored

      return {
        week,
        userName: orEmpty(row.userName),
        city: orEmpty(row.city),
        district: orEmpty(row.district),
        visitedDate: orEmpty(row.visitedDate),
        writtenDate: orEmpty(row.writtenDate),
        title: orEmpty(row.title),
        briefing: orEmpty(row.briefing),
        largeCoverUrl: orEmpty(row.largeCoverUrl),
        smallCoverUrl: orEmpty(row.smallCoverUrl),
        destinations,
        hashTags: orEmpty(row.hashTags)
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        blocks,
        searchText: buildSearchText(blocks),
        published: orEmpty(row.published).toUpperCase() !== 'FALSE',
      }
    })
    .filter((article) => includeUnpublished || article.published)
    .sort((a, b) => a.week - b.week)
}
