/**
 * 檢查 package-lock.json 有沒有漏掉「只有 Linux 需要」的套件。
 *
 * 為什麼需要這支：
 * 在 Windows 上跑 `npm install <某套件>` 時，npm 會增量更新 lock，
 * 並把當下平台用不到的相依裁掉。結果是——
 *
 *   本機 `npm ci` 一路綠燈 ✅   →   CI 在 Linux 上直接炸 ❌
 *   （npm error EUSAGE ... Missing: @emnapi/runtime from lock file）
 *
 * 這個坑在 Phase 6 踩過一次、Phase 10 又踩一次。只把「動過相依要重建 lock」
 * 寫在 CLAUDE.md 裡不夠，要有東西在本機就攔下來。
 *
 * 解法一律是：刪掉 node_modules 與 package-lock.json，重跑 `npm install`。
 *
 * 執行：npm run deps:check（已併進 npm run check）
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const LOCK = resolve(here, '../package-lock.json')

/**
 * Linux 上安裝時一定會用到、但 Windows 上可能被裁掉的套件。
 * 清單來自實際炸掉的 CI 錯誤訊息，之後若再遇到新的就補進來。
 */
const REQUIRED_ON_LINUX = [
  '@emnapi/runtime',
  '@emnapi/core',
  '@emnapi/wasi-threads',
  '@parcel/watcher',
]

const lock = JSON.parse(readFileSync(LOCK, 'utf8'))
const packages = lock.packages ?? {}

const missing = REQUIRED_ON_LINUX.filter((name) => !(`node_modules/${name}` in packages))

if (missing.length) {
  console.error('✗ package-lock.json 漏掉了 Linux 需要的套件：')
  missing.forEach((name) => console.error(`    ${name}`))
  console.error('')
  console.error('  本機 npm ci 會過，但 CI 在 Linux 上會以 EUSAGE 失敗。')
  console.error('  修法：')
  console.error('    rm -rf node_modules package-lock.json && npm install')
  console.error('')
  process.exit(1)
}

console.log(`✓ package-lock.json 完整（檢查了 ${REQUIRED_ON_LINUX.length} 個 Linux 專用套件）`)
