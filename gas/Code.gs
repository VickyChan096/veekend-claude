/**
 * Veekend 資料 API（Google Apps Script）
 *
 * 部署成 Web App 之後：
 *   GET  {url}?key=公開讀取不需要      → 回傳全部已發佈文章
 *   GET  {url}?includeUnpublished=1   → 連未發佈的一起回（需要 apiKey）
 *   POST {url}                        → 新增或更新一篇（需要 apiKey）
 *
 * 試算表要有四張工作表：articles / destinations / blocks / parts
 * 欄位定義見 docs/gas-setup.md。
 *
 * ⚠ 這裡的 rebuildArticles() 與專案的 scripts/build-from-rows.mjs 是同一套邏輯的
 *   兩份實作（GAS 不支援 ES module import）。改一邊記得改另一邊。
 */

var SHEET_ARTICLES = 'articles'
var SHEET_DESTINATIONS = 'destinations'
var SHEET_BLOCKS = 'blocks'
var SHEET_PARTS = 'parts'

/** 目錄的標題固定這個字，不存在試算表裡 */
var CATALOG_LABEL = '本週景點'

// ─────────────────────────────────────────────────────────────
// 進入點
// ─────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    var params = (e && e.parameter) || {}
    var includeUnpublished = params.includeUnpublished === '1'

    // 要看未發佈的內容才需要金鑰，公開讀取不用
    if (includeUnpublished && !isAuthorized(params.apiKey)) {
      return jsonResponse({ error: 'unauthorized' })
    }

    var articles = rebuildArticles(readAllTables(), includeUnpublished)
    return jsonResponse({ articles: articles, count: articles.length })
  } catch (error) {
    return jsonResponse({ error: String(error) })
  }
}

function doPost(e) {
  try {
    // 前端用 text/plain 送出以避開 CORS preflight，所以自己解析 body
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}')

    if (!isAuthorized(body.apiKey)) {
      return jsonResponse({ error: 'unauthorized' })
    }
    if (!body.article || !body.article.week) {
      return jsonResponse({ error: 'article.week is required' })
    }

    var week = Number(body.article.week)
    // 同一週的資料一次改完，避免中途失敗留下半套
    var lock = LockService.getScriptLock()
    lock.waitLock(20000)
    try {
      saveArticle(body.article)
    } finally {
      lock.releaseLock()
    }

    return jsonResponse({ ok: true, week: week })
  } catch (error) {
    return jsonResponse({ error: String(error) })
  }
}

// ─────────────────────────────────────────────────────────────
// 共用
// ─────────────────────────────────────────────────────────────

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  )
}

/** 金鑰存在指令碼屬性，不寫在程式碼裡 */
function isAuthorized(provided) {
  var expected = PropertiesService.getScriptProperties().getProperty('API_KEY')
  return Boolean(expected) && provided === expected
}

function getSheet(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
  if (!sheet) throw new Error('找不到工作表：' + name)
  return sheet
}

/** 用第一列當欄名，把工作表讀成物件陣列 */
function readTable(name) {
  var values = getSheet(name).getDataRange().getValues()
  if (values.length < 2) return []

  var headers = values[0].map(function (header) {
    return String(header).trim()
  })

  return values.slice(1).reduce(function (rows, line) {
    var hasValue = line.some(function (cell) {
      return String(cell).trim() !== ''
    })
    if (!hasValue) return rows

    var row = {}
    headers.forEach(function (header, index) {
      if (header) row[header] = line[index]
    })
    rows.push(row)
    return rows
  }, [])
}

function readAllTables() {
  return {
    articles: readTable(SHEET_ARTICLES),
    destinations: readTable(SHEET_DESTINATIONS),
    blocks: readTable(SHEET_BLOCKS),
    parts: readTable(SHEET_PARTS),
  }
}

// ─────────────────────────────────────────────────────────────
// 組裝（與 scripts/build-from-rows.mjs 對齊）
// ─────────────────────────────────────────────────────────────

function toNumber(value) {
  var n = Number(value)
  return isFinite(n) ? n : 0
}

function orEmpty(value) {
  return value === null || value === undefined ? '' : String(value)
}

function orUndefined(value) {
  var text = orEmpty(value).trim()
  return text ? text : undefined
}

function toImage(row) {
  var image = { src: orEmpty(row.imageSrc) }
  var alt = orUndefined(row.imageAlt)
  if (alt) image.alt = alt
  image.fullSrc = orEmpty(row.imageFullSrc) || orEmpty(row.imageSrc)
  var caption = orUndefined(row.imageCaption)
  if (caption) image.caption = caption
  return image
}

function toPart(row) {
  switch (row.kind) {
    case 'heading':
      return { kind: 'heading', level: toNumber(row.level), text: orEmpty(row.text) }
    case 'list':
      return {
        kind: 'list',
        items: orEmpty(row.text)
          .split(/\r?\n/)
          .map(function (item) {
            return item.trim()
          })
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

/** 目錄由「有 anchorId 的 section 的 h4 標題」推導 */
function buildCatalog(blocks) {
  var items = []
  blocks.forEach(function (block) {
    if (block.type !== 'section' || !block.anchorId) return
    var heading = null
    block.parts.forEach(function (part) {
      if (!heading && part.kind === 'heading' && part.level === 4) heading = part
    })
    if (heading) items.push({ anchor: block.anchorId, text: heading.text })
  })
  return items.length ? { type: 'catalog', label: CATALOG_LABEL, items: items } : null
}

function stripTags(html) {
  return orEmpty(html).replace(/<[^>]*>/g, ' ')
}

/** 搜尋索引：把區塊文字攤平 */
function buildSearchText(blocks) {
  var chunks = []
  function pushImage(image) {
    if (image && image.alt) chunks.push(image.alt)
    if (image && image.caption) chunks.push(image.caption)
  }

  blocks.forEach(function (block) {
    if (block.type === 'catalog') {
      block.items.forEach(function (item) {
        chunks.push(item.text)
      })
      return
    }
    if (block.type === 'gallery') {
      block.items.forEach(function (item) {
        if (item.heading) chunks.push(item.heading)
        if (item.html) chunks.push(stripTags(item.html))
        pushImage(item.image)
      })
      return
    }
    block.parts.forEach(function (part) {
      if (part.kind === 'heading') chunks.push(part.text)
      else if (part.kind === 'list')
        part.items.forEach(function (item) {
          chunks.push(stripTags(item))
        })
      else if (part.kind === 'paragraph') chunks.push(stripTags(part.html))
      else if (part.kind === 'imageText') {
        chunks.push(stripTags(part.html))
        pushImage(part.image)
      } else if (part.kind === 'image') pushImage(part.image)
    })
  })

  return chunks.join(' ').replace(/\s+/g, ' ').trim()
}

function rebuildArticles(tables, includeUnpublished) {
  return tables.articles
    .filter(function (row) {
      return orEmpty(row.week) !== ''
    })
    .map(function (row) {
      var week = toNumber(row.week)

      var destinations = tables.destinations
        .filter(function (item) {
          return toNumber(item.week) === week
        })
        .sort(function (a, b) {
          return toNumber(a.order) - toNumber(b.order)
        })
        .map(function (item) {
          return {
            name: orEmpty(item.name),
            rate: toNumber(item.rate),
            mapUrl: orEmpty(item.mapUrl),
            local: [toNumber(item.lat), toNumber(item.lng)],
          }
        })

      var stored = tables.blocks
        .filter(function (item) {
          return toNumber(item.week) === week
        })
        .sort(function (a, b) {
          return toNumber(a.order) - toNumber(b.order)
        })
        .map(function (item) {
          var blockOrder = toNumber(item.order)
          var rows = tables.parts
            .filter(function (part) {
              return toNumber(part.week) === week && toNumber(part.blockOrder) === blockOrder
            })
            .sort(function (a, b) {
              return toNumber(a.order) - toNumber(b.order)
            })

          if (item.type === 'gallery') {
            return {
              type: 'gallery',
              items: rows.map(function (part) {
                var galleryItem = { image: toImage(part) }
                var heading = orUndefined(part.heading)
                if (heading) galleryItem.heading = heading
                var html = orUndefined(part.text)
                if (html) galleryItem.html = html
                return galleryItem
              }),
            }
          }

          var section = { type: 'section', layout: orEmpty(item.layout) }
          var anchorId = orUndefined(item.anchorId)
          if (anchorId) section.anchorId = anchorId
          section.parts = rows.map(toPart).filter(Boolean)
          return section
        })

      var catalog = buildCatalog(stored)
      var blocks = catalog ? [catalog].concat(stored) : stored

      return {
        week: week,
        userName: orEmpty(row.userName),
        city: orEmpty(row.city),
        district: orEmpty(row.district),
        visitedDate: orEmpty(row.visitedDate),
        writtenDate: orEmpty(row.writtenDate),
        title: orEmpty(row.title),
        briefing: orEmpty(row.briefing),
        largeCoverUrl: orEmpty(row.largeCoverUrl),
        smallCoverUrl: orEmpty(row.smallCoverUrl),
        destinations: destinations,
        hashTags: orEmpty(row.hashTags)
          .split(',')
          .map(function (tag) {
            return tag.trim()
          })
          .filter(Boolean),
        blocks: blocks,
        searchText: buildSearchText(blocks),
        published: orEmpty(row.published).toUpperCase() !== 'FALSE',
      }
    })
    .filter(function (article) {
      return includeUnpublished || article.published
    })
    .sort(function (a, b) {
      return a.week - b.week
    })
}

// ─────────────────────────────────────────────────────────────
// 寫入
// ─────────────────────────────────────────────────────────────

/** 刪掉某一週在某張表的所有列（由下往上刪，避免索引位移） */
function deleteRowsForWeek(sheetName, week) {
  var sheet = getSheet(sheetName)
  var values = sheet.getDataRange().getValues()
  if (values.length < 2) return

  var weekIndex = values[0].indexOf('week')
  if (weekIndex === -1) throw new Error(sheetName + ' 沒有 week 欄')

  for (var i = values.length - 1; i >= 1; i -= 1) {
    if (toNumber(values[i][weekIndex]) === week) sheet.deleteRow(i + 1)
  }
}

/** 依表頭順序把物件排成一列 */
function toRow(sheetName, record) {
  var headers = getSheet(sheetName).getDataRange().getValues()[0]
  return headers.map(function (header) {
    var value = record[String(header).trim()]
    return value === null || value === undefined ? '' : value
  })
}

function appendRows(sheetName, records) {
  if (!records.length) return
  var sheet = getSheet(sheetName)
  var rows = records.map(function (record) {
    return toRow(sheetName, record)
  })
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows)
}

/**
 * 新增或更新一篇。作法是「先刪光該週的所有列，再整批寫回」，
 * 比逐格比對簡單，也不會留下孤兒列。
 */
function saveArticle(article) {
  var week = toNumber(article.week)

  deleteRowsForWeek(SHEET_ARTICLES, week)
  deleteRowsForWeek(SHEET_DESTINATIONS, week)
  deleteRowsForWeek(SHEET_BLOCKS, week)
  deleteRowsForWeek(SHEET_PARTS, week)

  appendRows(SHEET_ARTICLES, [
    {
      week: week,
      title: orEmpty(article.title),
      city: orEmpty(article.city),
      district: orEmpty(article.district),
      visitedDate: orEmpty(article.visitedDate),
      writtenDate: orEmpty(article.writtenDate),
      userName: orEmpty(article.userName),
      briefing: orEmpty(article.briefing),
      largeCoverUrl: orEmpty(article.largeCoverUrl),
      smallCoverUrl: orEmpty(article.smallCoverUrl),
      hashTags: (article.hashTags || []).join(','),
      published: article.published === false ? 'FALSE' : 'TRUE',
    },
  ])

  appendRows(
    SHEET_DESTINATIONS,
    (article.destinations || []).map(function (destination, index) {
      return {
        week: week,
        order: index + 1,
        name: orEmpty(destination.name),
        rate: toNumber(destination.rate),
        mapUrl: orEmpty(destination.mapUrl),
        lat: destination.local ? toNumber(destination.local[0]) : 0,
        lng: destination.local ? toNumber(destination.local[1]) : 0,
      }
    })
  )

  var blockRecords = []
  var partRecords = []

  // catalog 是推導出來的，寫回時要略過
  var stored = (article.blocks || []).filter(function (block) {
    return block.type !== 'catalog'
  })

  stored.forEach(function (block, blockIndex) {
    var blockOrder = blockIndex + 1
    blockRecords.push({
      week: week,
      order: blockOrder,
      type: block.type,
      layout: block.type === 'section' ? orEmpty(block.layout) : '',
      anchorId: block.type === 'section' ? orEmpty(block.anchorId) : '',
    })

    function pushPart(order, part) {
      partRecords.push({
        week: week,
        blockOrder: blockOrder,
        order: order,
        kind: part.kind,
        level: part.level === undefined ? '' : part.level,
        heading: orEmpty(part.heading),
        text: orEmpty(part.text),
        imageSrc: orEmpty(part.imageSrc),
        imageFullSrc: orEmpty(part.imageFullSrc),
        imageAlt: orEmpty(part.imageAlt),
        imageCaption: orEmpty(part.imageCaption),
      })
    }

    if (block.type === 'gallery') {
      ;(block.items || []).forEach(function (item, index) {
        pushPart(index + 1, {
          kind: 'galleryItem',
          heading: item.heading,
          text: item.html,
          imageSrc: item.image ? item.image.src : '',
          imageFullSrc: item.image ? item.image.fullSrc : '',
          imageAlt: item.image ? item.image.alt : '',
          imageCaption: item.image ? item.image.caption : '',
        })
      })
      return
    }

    ;(block.parts || []).forEach(function (part, index) {
      var order = index + 1
      if (part.kind === 'heading') pushPart(order, { kind: 'heading', level: part.level, text: part.text })
      else if (part.kind === 'list') pushPart(order, { kind: 'list', text: (part.items || []).join('\n') })
      else if (part.kind === 'paragraph') pushPart(order, { kind: 'paragraph', text: part.html })
      else if (part.kind === 'video') pushPart(order, { kind: 'video', text: part.src })
      else if (part.kind === 'image' || part.kind === 'imageText') {
        pushPart(order, {
          kind: part.kind,
          text: part.kind === 'imageText' ? part.html : '',
          imageSrc: part.image ? part.image.src : '',
          imageFullSrc: part.image ? part.image.fullSrc : '',
          imageAlt: part.image ? part.image.alt : '',
          imageCaption: part.image ? part.image.caption : '',
        })
      }
    })
  })

  appendRows(SHEET_BLOCKS, blockRecords)
  appendRows(SHEET_PARTS, partRecords)
}

// ─────────────────────────────────────────────────────────────
// 在編輯器裡手動跑，用來檢查資料有沒有讀對
// ─────────────────────────────────────────────────────────────

function testRead() {
  var articles = rebuildArticles(readAllTables(), true)
  Logger.log('共 ' + articles.length + ' 篇')
  articles.forEach(function (article) {
    Logger.log(
      'week ' +
        article.week +
        '：' +
        article.title +
        '｜景點 ' +
        article.destinations.length +
        '｜區塊 ' +
        article.blocks.length +
        '｜發佈 ' +
        article.published
    )
  })
}

// ─────────────────────────────────────────────────────────────
// 試算表改完自動重建網站
//
// 流程：編輯試算表 → onEditTrigger 記下時間 → 每分鐘跑一次的
//       checkAndDeploy 發現有新編輯且已停手 60 秒 → 呼叫 GitHub API 重建
//
// 為什麼不在 onEdit 直接觸發：改一篇文章通常會動到十幾格，每格都觸發
// 就會排隊建置十幾次。先記錄、停手後再送，一次就好。
//
// 需要的指令碼屬性（見 docs/gas-setup.md）：
//   GITHUB_TOKEN  GitHub 的 fine-grained token（Contents 寫入權限）
//   GITHUB_REPO   例如 VickyChan096/veekend-claude
// ─────────────────────────────────────────────────────────────

/** 停手多久之後才送出重建請求（毫秒） */
var DEPLOY_QUIET_MS = 60 * 1000

/** 安裝式觸發器：任何編輯都只記錄時間，不直接送出 */
function onEditTrigger() {
  PropertiesService.getScriptProperties().setProperty('LAST_EDIT_AT', String(Date.now()))
}

/** 每分鐘跑一次：有新編輯且已停手，就叫 GitHub 重建 */
function checkAndDeploy() {
  var props = PropertiesService.getScriptProperties()
  var lastEdit = Number(props.getProperty('LAST_EDIT_AT') || 0)
  var lastDeploy = Number(props.getProperty('LAST_DEPLOY_AT') || 0)

  if (!lastEdit || lastEdit <= lastDeploy) return // 沒有新編輯
  if (Date.now() - lastEdit < DEPLOY_QUIET_MS) return // 還在編輯中，再等等

  triggerDeploy()
  props.setProperty('LAST_DEPLOY_AT', String(Date.now()))
}

/** 呼叫 GitHub API 送出 repository_dispatch 事件 */
function triggerDeploy() {
  var props = PropertiesService.getScriptProperties()
  var token = props.getProperty('GITHUB_TOKEN')
  var repo = props.getProperty('GITHUB_REPO')

  if (!token || !repo) {
    Logger.log('尚未設定 GITHUB_TOKEN 或 GITHUB_REPO，略過')
    return
  }

  var response = UrlFetchApp.fetch('https://api.github.com/repos/' + repo + '/dispatches', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
    },
    payload: JSON.stringify({ event_type: 'sheets-updated' }),
    muteHttpExceptions: true,
  })

  var code = response.getResponseCode()
  // GitHub 成功時回 204 No Content
  if (code === 204) {
    Logger.log('已送出重建請求')
  } else {
    Logger.log('重建請求失敗（HTTP ' + code + '）：' + response.getContentText())
  }
}

/** 在編輯器手動跑一次，確認 token 與 repo 設定正確 */
function testDeploy() {
  triggerDeploy()
}

/**
 * 一鍵安裝兩個觸發器。在編輯器裡手動執行一次即可，重複執行會先清掉舊的。
 */
function installTriggers() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()

  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    var name = trigger.getHandlerFunction()
    if (name === 'onEditTrigger' || name === 'checkAndDeploy') ScriptApp.deleteTrigger(trigger)
  })

  ScriptApp.newTrigger('onEditTrigger').forSpreadsheet(sheet).onEdit().create()
  ScriptApp.newTrigger('checkAndDeploy').timeBased().everyMinutes(1).create()

  Logger.log('觸發器安裝完成：編輯試算表後約 1~2 分鐘會自動重建網站')
}
