/**
 * 驗證 Sheets 的四張表結構是否無損：
 *   articles.json → CSV（export-sheets.mjs）→ 重建 → 與原檔逐欄比對
 *
 * 只要這支跑得過，就代表把資料搬進 Sheets 不會掉東西。
 *
 * 執行：npm run sheets:verify
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { rebuildArticles } from './build-from-rows.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const SOURCE = resolve(here, '../app/assets/data/articles.json')
const CSV_DIR = resolve(here, 'sheets-export')

/** 極簡 CSV parser：夠用於自家匯出的格式（含引號、逃逸引號、格內換行） */
const parseCsv = (text) => {
  const clean = text.replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i]

    if (quoted) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          cell += '"'
          i += 1
        } else {
          quoted = false
        }
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\r') {
      // 交給 \n 處理
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }

  const [headers, ...body] = rows
  return body
    .filter((line) => line.some((value) => value !== ''))
    .map((line) => Object.fromEntries(headers.map((header, index) => [header, line[index] ?? ''])))
}

const readTable = (name) => parseCsv(readFileSync(join(CSV_DIR, name), 'utf8'))

const original = JSON.parse(readFileSync(SOURCE, 'utf8')).articles
const rebuilt = rebuildArticles(
  readTable('articles.csv'),
  readTable('destinations.csv'),
  readTable('blocks.csv'),
  readTable('parts.csv'),
  { includeUnpublished: true }
)

// 重建後多了 published 旗標，比對前先拿掉
const strip = (article) => {
  const copy = { ...article }
  delete copy.published
  return copy
}

let failures = 0

/** 遞迴排序物件的鍵，讓比對不受欄位順序影響 */
const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys(value[key])])
    )
  }
  return value
}

const compare = (label, a, b) => {
  const left = JSON.stringify(sortKeys(a))
  const right = JSON.stringify(sortKeys(b))
  if (left === right) return true
  failures += 1
  console.log(`✗ ${label}`)
  console.log('   原始:', left.slice(0, 240))
  console.log('   重建:', right.slice(0, 240))
  return false
}

console.log(`原始 ${original.length} 篇 ／ 重建 ${rebuilt.length} 篇`)
console.log()

if (original.length !== rebuilt.length) {
  failures += 1
  console.log('✗ 篇數不符')
}

original.forEach((article) => {
  const other = rebuilt.find((item) => item.week === article.week)
  if (!other) {
    failures += 1
    console.log(`✗ week ${article.week} 重建後找不到`)
    return
  }

  const fields = [
    'week',
    'userName',
    'city',
    'district',
    'visitedDate',
    'writtenDate',
    'title',
    'briefing',
    'largeCoverUrl',
    'smallCoverUrl',
    'hashTags',
    'destinations',
    'blocks',
    'searchText',
  ]

  const bad = fields.filter((field) => !compare(`week ${article.week} → ${field}`, article[field], other[field]))
  if (!bad.length) console.log(`✓ week ${String(article.week).padStart(2)} 完全一致`)
})

// 整體物件也比一次，避免有欄位漏在上面的清單外
compare('整體結構', original, rebuilt.map(strip))

console.log()
if (failures === 0) {
  console.log('✅ schema 無損：Sheets 四張表可以完整還原目前的資料')
} else {
  console.log(`❌ 有 ${failures} 處不一致`)
  process.exitCode = 1
}
