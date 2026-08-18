/**
 * 把 legacy 的文章內文 HTML 解析成結構化區塊。
 *
 *   讀：app/assets/data/db.json 的 articles[].content
 *   寫：app/assets/data/articles.json（Article + blocks[]）
 *
 * 為什麼是離線腳本而不是 runtime 解析：
 * - 解析只需跑一次，產出可以直接進版控並人工檢查
 * - node-html-parser 不會進 client bundle
 * - 之後資料改由 GAS 提供時，若 Sheets 仍存 HTML，重跑這支腳本即可
 *
 * 執行：npm run data:parse
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parse } from 'node-html-parser'

const here = dirname(fileURLToPath(import.meta.url))
const SOURCE = resolve(here, '../app/assets/data/db.json')
const TARGET = resolve(here, '../app/assets/data/articles.json')

/** articleStyle1~6 對應的版面 */
const LAYOUT_BY_CLASS = {
  articleStyle1: 'imageLeft',
  articleStyle2: 'imageRight',
  articleStyle3: 'imageFirst',
  articleStyle4: 'textFirst',
  articleStyle6: 'video',
}

const clean = (value) => (value ?? '').replace(/\s+/g, ' ').trim()

/**
 * 取出圖片。legacy 有兩種寫法：
 *   <img src="小圖">
 *   <a data-fancybox href="大圖" data-caption="說明"><img src="小圖"></a>
 * 沒有大圖的就用 src 自己當大圖——這輪決定讓所有內文圖片都能點開燈箱。
 */
const toImage = (node) => {
  if (node.tagName === 'A') {
    const img = node.querySelector('img')
    if (!img) return null
    const src = img.getAttribute('src') ?? ''
    return {
      src,
      alt: clean(img.getAttribute('alt')) || undefined,
      fullSrc: node.getAttribute('href') || src,
      caption: clean(node.getAttribute('data-caption')) || undefined,
    }
  }

  const src = node.getAttribute('src') ?? ''
  return {
    src,
    alt: clean(node.getAttribute('alt')) || undefined,
    fullSrc: src,
  }
}

/** .imgText：圖片上方疊一條說明 */
const toImageTextPart = (node) => {
  const paragraph = node.querySelector('p')
  const img = node.querySelector('img')
  if (!img) return null

  const anchor = img.parentNode?.tagName === 'A' ? img.parentNode : null
  const image = toImage(anchor ?? img)
  if (!image) return null

  return { kind: 'imageText', html: clean(paragraph?.innerHTML), image }
}

/** 把 section 的子節點依原始順序轉成 parts */
const toParts = (section) => {
  const parts = []

  const walk = (node) => {
    const tag = node.tagName
    if (!tag) return

    if (tag === 'H4' || tag === 'H5' || tag === 'H6') {
      parts.push({ kind: 'heading', level: Number(tag[1]), text: clean(node.textContent) })
      return
    }

    if (tag === 'UL') {
      const items = node.querySelectorAll('li').map((li) => clean(li.innerHTML))
      if (items.length) parts.push({ kind: 'list', items })
      return
    }

    if (tag === 'P') {
      const html = clean(node.innerHTML)
      if (html) parts.push({ kind: 'paragraph', html })
      return
    }

    if (tag === 'IMG') {
      const image = toImage(node)
      if (image) parts.push({ kind: 'image', image })
      return
    }

    if (tag === 'IFRAME') {
      parts.push({ kind: 'video', src: node.getAttribute('src') ?? '' })
      return
    }

    if (tag === 'A') {
      // 只有包著圖片的 <a> 算獨立區塊，行內連結由 paragraph／list 自己保留
      if (node.querySelector('img')) {
        const image = toImage(node)
        if (image) parts.push({ kind: 'image', image })
      }
      return
    }

    if (tag === 'DIV') {
      if (node.classList.contains('imgText')) {
        const part = toImageTextPart(node)
        if (part) parts.push(part)
        return
      }
      node.childNodes.forEach(walk)
      return
    }

    node.childNodes.forEach(walk)
  }

  section.childNodes.forEach(walk)
  return parts
}

/** articleStyle5：三欄圖文 */
const toGallery = (section) =>
  section
    .querySelectorAll('.articleStyle5__oneThird')
    .map((column) => {
      const img = column.querySelector('img')
      if (!img) return null
      const image = toImage(img.parentNode?.tagName === 'A' ? img.parentNode : img)
      if (!image) return null
      return {
        image,
        heading: clean(column.querySelector('h5')?.textContent) || undefined,
        html: clean(column.querySelector('p')?.innerHTML) || undefined,
      }
    })
    .filter(Boolean)

const toCatalog = (node) => ({
  type: 'catalog',
  label: clean(node.querySelector('p')?.textContent) || '本週景點',
  items: node.querySelectorAll('.catalogDest a').map((link) => ({
    anchor: (link.getAttribute('href') ?? '').replace(/^#/, ''),
    text: clean(link.textContent),
  })),
})

const parseContent = (html) => {
  if (!html) return []

  const root = parse(html)
  const blocks = []

  root.childNodes.forEach((node) => {
    if (!node.tagName) return

    if (node.classList?.contains('article__middle__catalog')) {
      blocks.push(toCatalog(node))
      return
    }

    if (node.tagName !== 'SECTION') return

    const styleClass = node.classList.value.find((name) => name.startsWith('articleStyle'))

    if (styleClass === 'articleStyle5') {
      const items = toGallery(node)
      if (items.length) blocks.push({ type: 'gallery', items })
      return
    }

    const layout = LAYOUT_BY_CLASS[styleClass]
    if (!layout) {
      console.warn(`  ⚠ 不認得的版面 class：${styleClass || '(無)'}，已略過`)
      return
    }

    const parts = toParts(node)
    if (!parts.length) return

    const anchorId = node.getAttribute('id') || undefined
    blocks.push({ type: 'section', layout, anchorId, parts })
  })

  return blocks
}

const db = JSON.parse(readFileSync(SOURCE, 'utf8'))

const articles = db.articles.map((article) => {
  const blocks = parseContent(article.content)
  // content 已經解析成 blocks，不再帶著原始 HTML，避免同一份資料兩種來源
  const rest = { ...article }
  delete rest.content
  return { ...rest, blocks }
})

writeFileSync(TARGET, `${JSON.stringify({ articles }, null, 2)}\n`, 'utf8')

console.log('已寫入', TARGET)
articles.forEach((article) => {
  const counts = article.blocks.reduce((acc, block) => {
    const key = block.type === 'section' ? `section:${block.layout}` : block.type
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  const summary = Object.entries(counts)
    .map(([key, value]) => `${key}×${value}`)
    .join(' ')
  console.log(`  week ${String(article.week).padStart(2, ' ')}：${summary || '(無內文)'}`)
})
