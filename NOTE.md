# Veekend 重構 — Phase 紀錄

每個 phase 收尾時更新本檔。Token 欄位由 Vicky 執行 `/cost` 後自行填入（AI 無法讀取計費資料，不要代填估算值）。

## 總覽

| Phase | 日期       | 內容                      | Tokens                     | 費用   |
| ----- | ---------- | ------------------------- | -------------------------- | ------ |
| 1     | 2026-08-18 | 專案調查與 CLAUDE.md 改寫 |                            |        |
| 2     | 2026-08-18 | 基礎建設                  | 1.7k input, 50.0k output   | $4.59  |
| 3     | 2026-08-18 | 共用元件庫與 Example page | 2.3k input, 137.7k output  | $14.04 |
| 4     | 2026-08-18 | 首頁與 layout 移植        | 3.0k input, 187.0k output, | $23.13 |
| 5     | 2026-08-18 | 文章頁移植                | 3.7k input, 240.2k output  | $36.68 |
| 6     | 2026-08-18 | 部署上線 GitHub Pages     | 4.8k input, 288.3k output, | $53.97 |
| 7     | 2026-08-18 | 搜尋結果頁與關於頁        | 5.0k input, 318.5k output  | $74.10 |
| 8     | 2026-08-18 | Google Sheets + GAS 資料庫 |                            |        |

---

## Phase 1 — 專案調查與 CLAUDE.md 改寫（2026-08-18）

### 做了什麼

調查三個來源，改寫 `CLAUDE.md`，從「角色扮演＋技術棧清單」轉為**專案約定書**。

### 調查發現

**veekend-nuxt 現況**：剛 init 的空殼，只有 `app/app.vue`，無 commit。實際是 **Nuxt 4.5.2**（原 CLAUDE.md 寫 Nuxt 3）。Vuetify、MapLibre GL、sass 均未安裝。多裝了無關的 `@nuxt/content`、`@nuxt/a11y`、`better-sqlite3`。

**參考專案 `D:\2026\2025_NPS_NatureDB`**

- 根目錄 `CLAUDE.md` 是「導航指引」風格——不列技術棧，只講怎麼查功能關係地圖（`004_FlowMap/ai.ndjson`）＋三條鐵則。適合已有大量程式碼的專案。
- `002_View` 是成熟的 Nuxt 4 + Vuetify 3 專案，慣例可直接抄。

**legacy-app 實況**（與原 CLAUDE.md 有實質落差）

- 地圖是 **Leaflet 1.8**，不是 MapLibre GL
- 資料源是**靜態 `db.json`**（jQuery `$.ajax` 抓 GitHub Pages 上的檔案），**沒有 GAS / Sheets**
- **沒用到 Dayjs、Flatpickr**（日期是 `"2019.10.20"` 字串）
- 相依：jQuery 3.6、axios、SweetAlert、Fancybox 4、Swiper、Font Awesome、YouTube iframe
- 7 支 HTML 共 857 行、JS 897 行；SCSS 已有 partial 架構可移植
- `login.html` 是把明文密碼放 `db.json` 比對的假登入

### 定案的決定

| 議題           | 決定                                                     |
| -------------- | -------------------------------------------------------- |
| CLAUDE.md 定位 | 專案約定書（不是導航圖——還沒程式碼可導航）               |
| Vuetify 接法   | `vite-plugin-vuetify` + `build.transpile`，對齊 002_View |
| auto-import    | **全關**，一律顯式 import                                |
| 文件語言       | 中文為主，技術名詞保留原文                               |
| 地圖套件       | Leaflet → **MapLibre GL**                                |
| 資料來源       | 靜態 db.json → **GAS + Google Sheets**                   |
| 附屬套件       | 能用 Vuetify 就用 Vuetify                                |

### 從 002_View 抄進約定書的慣例

`app/` 分層目錄、`components`/`composables`/`types` 再依 `common/layouts/pages` 分層、型別放 `app/types/`、API 集中 `app/services/`、SCSS 用 `additionalData` 全域注入。

**不能照抄**：002_View 是 IIS + SSR（`--preset=iis_node`），veekend 是 GitHub Pages + SSG，方向相反。

### 待確認的判斷

1. **GAS 讀寫分離**——目前寫成「讀取 build 時靜態化、寫入 client 端 POST」。若要列表不重新部署就反映 Sheets 更新，讀取需改 client 端，但犧牲 SEO。
2. **login 權限模型**——legacy 的假登入不可照抄，純靜態站做不了真正驗證，屬產品決策，尚未決定。

### 產出

- `CLAUDE.md`（88 行，全面改寫）

┌────────────────────────────────────────────────────────────────────────────────────────────────┬────────────────────┐
│ 項目 │ 粗估 │
├────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────┤
│ 輸出（我寫的文字＋CLAUDE.md） │ 約 12–16k tokens │
├────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────┤
│ 工具結果讀進來的內容（6 次 Bash，含 002_View 的 nuxt.config、package.json、legacy 檔案清單等） │ 約 8–10k tokens │
├────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────┤
│ 累計輸入（每輪都會重送整段對話＋system prompt，大部分命中快取） │ 約 150–250k tokens │
└────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────────┘

---

## Phase 2 — 基礎建設（2026-08-18）

### 做了什麼

把空殼專案補成可 build 的骨架，並驗證三條最容易出事的規則（SSG、Vuetify SSR、MapLibre + ClientOnly）確實可行。

### 相依調整

**移除**：`@nuxt/content`、`@nuxt/a11y`、`better-sqlite3`（與本案無關）
**新增（dependencies）**：`vuetify@3.13`、`maplibre-gl@6.4`
**新增（devDependencies）**：`vite-plugin-vuetify`、`sass`、`@iconify-json/mdi`、`@types/node`、`vue-tsc`、`typescript`
**移位**：`@nuxt/*`、`eslint` 從 dependencies 移到 devDependencies（對齊 002_View）

註：`maplibre-gl` 裝到 6.x，002_View 是 5.x——大版本不同，API 有差異時以本案實測為準。

### 產出

| 檔案                                                            | 內容                                                                                                                                                                                                                                    |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nuxt.config.ts`                                                | SSG（`nitro.preset: 'github_pages'`）、`app.baseURL` 由 env 控制、`imports.autoImport: false`、`components.dirs: []`、Vuetify plugin、SCSS `additionalData`、`icon` 全打包進 client（`fallbackToApi: false`）、`image.provider: 'none'` |
| `app/plugins/vuetify.ts`                                        | veekend 主題（`#ffe60f` / `#000` / `#535353`），圖示走 `@nuxt/icon` 的 `<Icon>`                                                                                                                                                         |
| `app/assets/scss/preprocess.scss`                               | 移植 legacy `_variable.scss` + `_mixin.scss`                                                                                                                                                                                            |
| `app/assets/scss/main.scss`、`_reset.scss`                      | 全域樣式進入點與基礎 reset                                                                                                                                                                                                              |
| `app/app.vue`、`app/layouts/default.vue`、`app/pages/index.vue` | app shell                                                                                                                                                                                                                               |
| `app/types/api/article.ts`                                      | 依 `db.json` 全 12 筆掃描定義的 `Article` / `Destination`                                                                                                                                                                               |
| `app/types/api/user.ts`                                         | `PublicUser`（明文密碼欄位刻意不納入）                                                                                                                                                                                                  |
| `app/services/ServiceBase.ts`                                   | GAS 讀寫基底（POST 用 `text/plain` 規避 preflight）                                                                                                                                                                                     |
| `app/components/common/BaseMap.vue`                             | MapLibre 煙霧測試元件                                                                                                                                                                                                                   |
| `.env.example`                                                  | `NUXT_APP_BASE_URL`、`NUXT_PUBLIC_GAS_API_URL`                                                                                                                                                                                          |
| `package.json`                                                  | 新增 `check`（`nuxt typecheck`）、`lint`、`lint:fix`                                                                                                                                                                                    |

目錄骨架：`app/{assets,components,composables,constants,layouts,middleware,pages,plugins,services,types,utils}`，空目錄以 `.gitkeep` 佔位。

### 踩到的坑

**`additionalData` 不會傳遞到 partial**——`vite.css.preprocessorOptions.scss.additionalData` 只注入 Vite 的進入點（`main.scss`、各 `.vue` 的 `<style>`），被 `@use` 進來的 partial 拿不到變數，`nuxt generate` 直接報 `Undefined variable`。解法是 partial 開頭自己寫 `@use 'preprocess' as *;`（002_View 的 `_table.scss` 也是這樣寫）。已補成 CLAUDE.md 硬規則第 7 條。

### 驗證結果

- `npm run generate` ✅ 產出 `.output/public`，含 `.nojekyll`、`404.html`、`200.html`，prerender 4 routes
- `npm run check`（typecheck）✅ 無錯誤
- `npm run lint` ✅ 無錯誤
- Vuetify SSR ✅ `index.html` 含 `class="v-application v-theme--veekend ..."`
- `lang="zh-Hant-TW"`、`<title>Veekend</title>` ✅
- MapLibre ✅ `<ClientOnly>` + 動態 import 在 prerender 階段不報錯，CSS 已 code-split

### 待確認／未完成

- `app.baseURL` 正式值待定——GitHub Pages repo 名稱尚未決定，目前預設 `/`。legacy 舊站在 `vickychan096.github.io/veekend/`
- `NUXT_PUBLIC_GAS_API_URL` 尚無值，GAS 端未建
- `BaseMap` 圖磚來源仍是 MapLibre demotiles，需換正式來源
- legacy `_reset.scss`（196 行）與 `_layout.scss`（597 行）僅移植骨架
- Phase 1 遺留的兩個判斷（GAS 讀寫分離、login 權限模型）仍未拍板

### Session

Total cost: $4.59
Total duration (API): 12m 5s
Total duration (wall): 47m 18s
Total code changes: 0 lines added, 0 lines removed
Usage by model:
claude-haiku-4-5: 1.8k input, 36 output, 0 cache read, 0 cache write ($0.0020)
claude-opus-5: 1.7k input, 50.0k output, 4.2m cache read, 120.3k cache write ($4.59)

### 下一步（Phase 3）

移植首頁：`legacy-app/index.html` + `js/index.js` → `pages/index.vue`（輪播、文章列表、load more）

---

## Phase 3 — 共用元件庫與 Example page（2026-08-18）

### 做了什麼

去蕪存菁兩個舊專案：**設計沿用 legacy-app、架構與寫法依照 002_View**，建出完整的 design token 系統與 30 個共用元件，加一頁可以一眼看完所有元件的 Example page。

### 先定的規則（已寫進 CLAUDE.md 開頭）

- 本專案只有 Vicky 一人開發，文件與註解不出現其他人名或代稱（先前誤用的代稱已全數改掉）
- **動手前先問**——不確定的地方一次問完再實作
- 參考來源分工：legacy-app 只給設計，002_View 決定結構與寫法

### 定案的決定

| 議題         | 決定                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| Design token | 完整架構**加深色模式**（CSS 變數、六階 typography mixin、z-index、border-radius） |
| 元件範圍     | 搬進 002_View 的通用元件，約 25 個（排除地圖儀表板那 15 個）                      |
| `:root` 位置 | **改良**：留在 `_theme.scss` 由 `main.scss` 載入一次，不放 preprocess             |
| 表單驗證     | 一併照搬（FieldWrap / BaseLabel / rules / 失焦才驗證）                            |

### 為什麼 `:root` 要改良

002_View 把 `:root { ... }` 寫在 `preprocess.scss`，而該檔會被 `additionalData` 注入**每一個** scss 進入點——等於每個 `.vue` 的 scoped style 都重複輸出一份 CSS 變數。veekend 改成 token 定義留在 `preprocess.scss`（純變數與 mixin），`:root` 輸出獨立成 `_theme.scss`，只由 `main.scss` 載入一次。

### 設計 token（設計值來自 legacy）

- 色票：黃 `#ffe60f`／黑 `#000`／灰 `#535353`／淺灰 `#eee`／紅 `#e60012`，另補 `frame`（legacy 的黑底外框）、success、info 與各自的 container
- 深色模式保留黃色不變，surface 換成 `#1a1a1a`，透過 `[data-theme='dark']` 切換
- 字級六階（32 / 24 / 20 / 18 / 16 / 14px）× bold / medium / regular，額外一個 `@include display` 給 legacy 的 Archivo Black 英文大標
- 斷點兩組並存：max-width 的 `pad` / `mobile` / `min-mobile`（值與 legacy 相同，移植版面時用）、min-width 的 `tablet` / `laptop` / `desktop`（新元件用）
- 002_View 是把 18 個 typography mixin 逐個展開寫，這裡收斂成共用的 `typography()`，對外 mixin 名稱與用法不變

### 產出

**SCSS**：`preprocess.scss`（198 行）、`_theme.scss`、`main.scss`、`_reset.scss`

**基礎設施**：`plugins/vuetify.ts`（淺色＋深色主題）、`plugins/globalStores.ts`、`composables/common/` 的 `useAlert` / `useDialog` / `useFetchLoading` / `useThemeMode`、`utils/common/form/rules.ts`、`utils/common/date/formatDate.ts`、`utils/common/focusTo.ts`

**共用元件（30 個）**

| 分類       | 元件                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 表單       | FieldWrap、BaseLabel、BaseInput、PasswordInput、BaseTextarea、BaseSelect、BaseDatepicker、BaseCheckbox、BaseCheckboxGroup、BaseRadioGroup |
| 按鈕       | BaseButton、BaseIconButton                                                                                                                |
| 展示       | BaseCard、BaseChip、BaseRating、BaseDivider、BaseTooltip、BreadCrumbs                                                                     |
| 導覽與資料 | BaseTab、BaseTable、BasePagination、BaseExpansion                                                                                         |
| 回饋       | BaseAlert、BaseDialog、BaseLoading、FetchLoading、GlobalComponents                                                                        |
| 媒體       | BaseCarousel、BaseLightbox、BaseMap                                                                                                       |

取代關係：Swiper → BaseCarousel、SweetAlert → BaseAlert / BaseDialog、Fancybox → BaseLightbox、Font Awesome → `@nuxt/icon` 的 mdi、Leaflet → MapLibre GL、flatpickr → Vuetify 的 VDatePicker（日期格式沿用 legacy 的 `2019.10.20`，自己寫轉換不引入 dayjs）。

`BaseCard` 保留了 legacy 最有記憶點的設計：封面圖預設 `grayscale(100%)`，hover 才 `scale(1.2)` 並回復彩色。

**Example page**：`pages/example.vue` + `components/pages/example/` 底下 11 個元件（9 個展示區塊 + `ExampleSection` / `ExampleRow` 兩個共用外框）。002_View 是每個 Example\* 各自重複寫 fieldset，這裡收斂成共用外框。頁面附深色模式切換與「顯示所有元素外框」開關。

### 踩到的坑

1. **`ariaLabel` prop 會與原生 `aria-label` 撞名**——傳 `aria-label="…"` 時 vue-tsc 當成 HTML 屬性而非 prop，必填的 prop 就會報「missing」。改成 prop 叫 `label`（`BaseIconButton`）。
2. **prerender crawler 會跟著示範連結爬**——Example page 的 BreadCrumbs 示範原本指向 `/article`，該路由不存在，`nuxt generate` 直接失敗。示範連結只能指向已存在的路由。
3. **改 token 名稱要一起改用到的地方**——`preprocess.scss` 換成新命名後，`BaseMap.vue` 與 `index.vue` 仍在用 legacy 的 `$br-m` / `$fz-l` / `$c3rd`，generate 才報 `Undefined variable`。

### 驗證結果

- `npm run generate` ✅ prerender 6 routes（含 `/example`），Archivo Black 由 `@nuxt/fonts` 自動抓取
- `npm run check`（typecheck）✅ 無錯誤
- `npm run lint` ✅ 無錯誤
- Example page ✅ 已 SSR 渲染出元件內容

### 待確認／未完成

- `layouts/default.vue` 還是空殼，legacy 的 header / footer / aside 尚未移植
- `app.baseURL` 正式值待定（GitHub Pages repo 名稱未決）
- `NUXT_PUBLIC_GAS_API_URL` 無值，GAS 端未建
- `BaseMap` 圖磚仍是 MapLibre demotiles
- Phase 1 遺留的兩個判斷（GAS 讀寫分離、login 權限模型）仍未拍板

Session

Total cost: $14.04
Total duration (API): 29m 32s
Total duration (wall): 1h 29m 34s
Total code changes: 0 lines added, 0 lines removed
Usage by model:
claude-haiku-4-5: 1.8k input, 36 output, 0 cache read, 0 cache write ($0.0020)
claude-opus-5: 2.3k input, 137.7k output, 16.4m cache read, 238.5k cache write ($14.04)

### 下一步（Phase 4）

移植首頁：`legacy-app/index.html` + `js/index.js` → `pages/index.vue`，同時把 `js/layout.js` / `js/aside.js` 移進 `layouts/default.vue` 與 `components/layouts/`。

---

## Phase 4 — 首頁與 layout 移植（2026-08-18）

### 做了什麼

把 legacy 的 `index.html` + `js/index.js` + `js/layout.js` + `js/aside.js` 移植成 Nuxt 頁面與元件，並把 30MB 的圖片資產與 `db.json` 搬進專案。資料先讀本地 JSON，之後換 GAS 只需改 `ArticleService`。

### 資產搬移

- `legacy-app/images/`（132 檔、30MB）→ `public/images/`
- `legacy-app/dataBase/db.json` → `app/assets/data/db.json`

### 產出

| 檔案                                                         | 對應 legacy                   | 說明                                                                                         |
| ------------------------------------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------- |
| `services/pages/ArticleService.ts`                           | `$.ajax` / `axios` 抓 db.json | 目前讀本地 JSON，換 GAS 只動這個檔                                                           |
| `composables/pages/useArticles.ts`                           | 各頁重複的資料處理            | 用 `useAsyncData` 包，prerender 時抓完寫進 payload；另提供依縣市分組、hashTag 排行、景點去重 |
| `composables/common/useAssetUrl.ts`                          | —                             | 幫資料裡的圖片路徑補上 `app.baseURL`                                                         |
| `layouts/default.vue`                                        | `js/layout.js`                | Header + main + Footer + ScrollToTop                                                         |
| `components/layouts/HeaderBar.vue`                           | `createHeader()`              | 黃底 fixed、logo、漢堡鍵、搜尋、三組縣市下拉選單                                             |
| `components/layouts/FooterBar.vue`                           | `createFooter()`              | 灰階大圖、社群連結（黃色底線 hover）、版權                                                   |
| `components/layouts/ScrollToTopButton.vue`                   | `#toTop`                      | 捲超過 200px 才淡入                                                                          |
| `components/layouts/SiteAside.vue`                           | `js/aside.js`                 | 頭像、社群、隨機三篇熱門、hashTag 前 10、廣告                                                |
| `components/pages/index/HeroCarousel.vue`                    | Swiper 區塊                   | 改吃資料（原本三張硬編碼），parallax 用 CSS transition 近似                                  |
| `components/pages/index/ArticleList.vue`                     | `createArticleList()`         | 用 BaseCard，一次 5 筆、LOAD MORE 往後追加                                                   |
| `components/pages/index/DestinationMap.vue`                  | Leaflet 地圖                  | MapLibre GL + OSM raster 圖磚，景點 marker 與 popup                                          |
| `components/pages/PagePlaceholder.vue`                       | —                             | 未重構頁面的佔位                                                                             |
| `pages/{about,login,result}.vue`、`pages/article/[week].vue` | 同名 legacy 頁                | 佔位頁                                                                                       |

### 為什麼要先建佔位頁

`nuxt generate` 的 crawler 會跟著站內連結爬，連到不存在的路由**會讓建置直接失敗**。header 選單與文章列表都連向 `/article/N`、`/result`、`/about`、`/login`，所以這四個路由必須先存在。副作用是 `/article/1`～`/article/12` 已經各自產生靜態頁，Phase 5 只要把內容填進去。

### 踩到的坑

**子路徑建置全數失敗，而且不會報錯。** 用 `NUXT_APP_BASE_URL=/veekend/ npm run generate` 建置後，每個頁面都只產出 `"Redirecting..."`，路由數從 36 掉到 3——但建置回報成功。

> ⚠ 這一段當時的診斷是**錯的**，Phase 5 才查出真正原因，見下方 Phase 5 的更正。當時誤判為「Nuxt 把同名環境變數再套用一次」，於是把變數改名為 `VEEKEND_BASE_URL`，並新增 `generate:gh` script 走 `--dotenv .env.production`（比照 002_View）。改名本身沒有壞處，`generate:gh` 也留著，但**改名不是解法**，真正原因是 Git Bash 的路徑轉換。

驗證過子路徑輸出全部正確：`/veekend/images/week1/cover.jpg`、`/veekend/article/1`、`/veekend/_nuxt/*.js`。

**side note**：側欄的「隨機三篇熱門文章」包在 `useAsyncData` 裡。legacy 是每次載入現抽，直接搬會讓 SSR 與 hydration 抽到不同結果而畫面閃動；包起來後抽選只在 prerender 發生一次並寫進 payload，效果變成「每次重新部署換一批」。

### 驗證結果

- `npm run generate` ✅ prerender 36 routes（baseURL=`/`）／41 routes（baseURL=`/veekend/`）
- `npm run check` ✅ ／ `npm run lint` ✅
- 首頁 SSR 已渲染出輪播、文章列表、側欄
- 子路徑下圖片、站內連結、JS 資源路徑全部正確

### 待確認／未完成

- `app.baseURL` 正式值待定——repo 名稱決定後建 `.env.production` 填 `VEEKEND_BASE_URL`
- 資料仍讀本地 `db.json`，GAS 端未建
- 搜尋、關於、登入、文章頁都還是佔位頁
- Phase 1 遺留的 login 權限模型仍未拍板

  Total cost: $23.13
  Total duration (API): 40m 25s
  Total duration (wall): 2h 0m 19s Total code changes: 1271 lines added, 25 lines removed
  Usage by model:
  claude-haiku-4-5: 1.8k input, 36 output, 0 cache read, 0 cache write ($0.0020)
  claude-opus-5: 3.0k input, 187.0k output, 30.4m cache read, 323.1k cache write ($23.13)

### 下一步（Phase 5）

移植文章頁：`legacy-app/article6.html` + `js/article.js` → `pages/article/[week].vue`（內文、圖庫燈箱、景點地圖與評分）。

---

## Phase 5 — 文章頁移植（2026-08-18）

### 做了什麼

把 legacy 的 `article.html` + `js/article.js` 移植成 `pages/article/[week].vue`。內文原本是 db.json 裡一大塊 HTML，改成先解析成結構化區塊，再用 Vue 元件渲染。

### 定案的決定

| 議題     | 決定                                                         |
| -------- | ------------------------------------------------------------ |
| 內文渲染 | 解析成結構化資料，不用 v-html 整篇塞                         |
| 燈箱範圍 | 所有內文圖片都可點開（legacy 只有 7 張標了 `data-fancybox`） |

### 內文解析

legacy 把整篇內文以 HTML 存在 `db.json` 的 `content`，用 `innerHTML` 塞進頁面。裡面有 6 種版型（`articleStyle1~6`）、景點目錄、7 個 fancybox 連結、7 個 YouTube iframe，只有 week 1–6 有內容。

**做法**：離線腳本 `scripts/parse-articles.mjs`（`npm run data:parse`）把 `db.json` 轉成 `articles.json`，內文變成 `blocks[]`。選離線而非 runtime 解析的理由：解析只需跑一次、產出可進版控並人工檢查、`node-html-parser` 不會進 client bundle。

**區塊模型**（`app/types/api/articleContent.ts`）

- `catalog`：本週景點目錄
- `section`：`layout` 分 `imageLeft` / `imageRight` / `imageFirst` / `textFirst` / `video`，內含順序化的 `parts[]`（heading / list / paragraph / image / imageText / video）
- `gallery`：三欄圖文（legacy 的 `articleStyle5`）

只有段落與清單項目保留行內 HTML（`<a>` `<u>` `<mark>` `<br>`），用 `v-html` 渲染。

**驗證**：逐篇比對原始 HTML 與解析結果的 `<img>`、`<iframe>`、`<li>` 數量，12 篇全部相符，零遺漏。

### 產出

| 檔案                                             | 說明                                           |
| ------------------------------------------------ | ---------------------------------------------- |
| `scripts/parse-articles.mjs`                     | HTML → 結構化區塊的轉換腳本                    |
| `app/types/api/articleContent.ts`                | 區塊模型                                       |
| `app/assets/data/articles.json`                  | 腳本產出，`ArticleService` 改讀這份            |
| `components/pages/article/ArticleHero.vue`       | 壓暗大圖 + 週次地區，含背景緩移動畫            |
| `components/pages/article/ArticleBody.vue`       | 區塊分派器，燈箱集中在這層，可左右切換全篇圖片 |
| `components/pages/article/ArticleCatalog.vue`    | 可摺疊的景點目錄                               |
| `components/pages/article/ArticleSection.vue`    | 五種版面 + 六種 part 的渲染                    |
| `components/pages/article/ArticleGallery.vue`    | 三欄圖文                                       |
| `components/pages/article/ArticleMapAndTags.vue` | 本週景點地圖 + hashTags                        |
| `components/pages/article/ArticleNav.vue`        | 上一篇／下一篇，頭尾顯示「沒有上／下一篇囉」   |

`DestinationMap` 加上 `areaLabel` / `height` / `zoom` / `focus` 四個 prop，首頁（全台 zoom 6.5）與文章頁（單週 zoom 14 定在第一個景點）共用。

`ArticleService` 新增 `findNeighbours()`。無內文的 week 7–12 顯示「這篇還在趕稿中」。

### 更正 Phase 4 的誤判

**Phase 4 記錄的 baseURL 診斷是錯的。** 當時判定「Nuxt 把同名環境變數 `NUXT_APP_BASE_URL` 再套用一次」，把變數改名為 `VEEKEND_BASE_URL`。

真正原因是 **Git Bash（MSYS）的 POSIX 路徑轉換**：在 shell 寫 `NUXT_APP_BASE_URL=/veekend/`，值會被改寫成 `C:/Program Files/Git/veekend/`。baseURL 變成 Windows 絕對路徑，router base 對不上請求路徑，於是每頁只產出 `"Redirecting..."`。當時「硬編碼就正常」之所以成立，只是因為硬編碼不經過 shell。

驗證方式：`VEEKEND_BASE_URL=/veekend/ node -e "console.log(process.env.VEEKEND_BASE_URL)"` 直接印出 `C:/Program Files/Git/veekend/`。

**已改回 `NUXT_APP_BASE_URL`**（Nuxt 標準名稱，實測沒有重複套用問題）。正確用法：加 `MSYS_NO_PATHCONV=1`，或走 `npm run generate:gh` 讀 `.env.production`（`--dotenv` 讀檔不經過 shell）。子路徑建置驗證 41 routes 全數正確。

教訓：**跨平台的 shell 行為要先單獨驗證變數本身**，不要從「換個寫法就好了」直接推論原因。

### 另外修掉的 bug

**Vuetify 的 checkbox / radio 圖示載不出來。** 兩層原因：

1. Vuetify 內建 alias 給的是 `mdi-checkbox-marked`（連字號），`@nuxt/icon` 要 `mdi:checkbox-marked`（冒號）。在 `plugins/vuetify.ts` 加了轉換。
2. `icon.clientBundle.scan` 只掃得到原始碼裡寫死的名稱，Vuetify 執行期才從 alias 取的圖示掃不到。在 `nuxt.config.ts` 加 `VUETIFY_ICONS` 清單點名 35 個。

修掉後 client bundle 從 25 個圖示變成 47 個，警告消失。

### 驗證結果

- `npm run data:parse` ✅ 12 篇全數解析，圖片／影片／清單數量與原始 HTML 完全相符
- `npm run generate` ✅ 36 routes（子路徑 41 routes），無 icon 警告
- `npm run check` ✅ ／ `npm run lint` ✅
- 文章頁 SSR 已渲染出目錄、錨點、五種版面、圖片、YouTube、上下篇導覽、hashTags
- week 7–12 正確顯示空狀態

### 待確認／未完成

- 搜尋結果、關於、登入、編輯頁仍是 `PagePlaceholder`
- GAS 端未建；`app.baseURL` 正式值待定（repo 名稱未決）
- login 權限模型仍未拍板

  Total cost: $36.68
  Total duration (API): 52m 16s
  Total duration (wall): 3h 30m 19s
  Total code changes: 2683 lines added, 59 lines removed
  Usage by model:
  claude-haiku-4-5: 1.8k input, 36 output, 0 cache read, 0 cache write ($0.0020)
  claude-opus-5: 3.7k input, 240.2k output, 52.9m cache read, 419.4k cache write ($36.68)

### 下一步（Phase 6）

移植搜尋結果頁與關於頁：`legacy-app/result.html` + `js/result.js`、`about.html`。

---

## Phase 6 — 部署上線 GitHub Pages（2026-08-18）

### 成果

**站台已上線：https://vickychan096.github.io/veekend-claude/**

repo：`VickyChan096/veekend-claude`（新開，Public）。push 到 `main` 就自動建置部署。

### 事前發現

`VickyChan096/veekend-nuxt` 這個 repo 早就存在——2026-05 的前一次嘗試（`@nuxt/content` + `content/blog/*.md`，頁面在 `app/pages/weekly/`），Pages 也是活的。這解釋了為什麼 Phase 1 的 `package.json` 裡有 `@nuxt/content`。決定不動它，另開 `veekend-claude`。2022 年的舊站 `veekend` repo 也保持原狀。

### 部署設定

`.github/workflows/deploy.yml`：

- `NUXT_APP_BASE_URL: /${{ github.event.repository.name }}/` ——**baseURL 自動從 repo 名稱組出**，改名或搬 repo 都不用改設定
- 建置前跑 `npm run check`（typecheck），失敗就不部署
- `configure-pages` 加 `enablement: true`，自動啟用 Pages，不用手動去 Settings 設定
- actions 一律用 v5（v4 是為 Node 20 寫的，runner 會強制它跑在 Node 24 上）

### 踩到的坑：lock 檔在 Windows 上產生會漏掉 Linux 專用套件

CI 的 `npm ci` 連續三次在 **1 秒內**失敗，但本地 `npm ci` 一路正常。

```
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and
npm error package-lock.json are in sync.
npm error Missing: @emnapi/runtime@1.11.3 from lock file
npm error Missing: @emnapi/core@1.11.3 from lock file
npm error Missing: @parcel/watcher@2.6.0 from lock file
```

**原因**：lock 檔在 Windows 上經過多輪 `npm uninstall` / `npm install -D` 後進入部分狀態，漏掉只有 Linux 需要的套件（`@emnapi/*` 是 sharp 的 wasm fallback，`@parcel/watcher` 連基底套件都缺）。Windows 上用不到這些，所以本地 `npm ci` 一路綠燈，**只有 Linux runner 會炸**。

**解法**：刪掉 `node_modules` 與 `package-lock.json` 重跑 `npm install`。三個套件都補回來，副作用只有 vuetify 3.13.1 → 3.13.2。

**教訓**：本地 `npm ci` 通過**不代表** CI 會通過——lock 檔是跟著產生它的平台走的。動過相依之後，要嘛重建 lock，要嘛就別相信本地驗證。

### 診斷方式（下次可以直接用）

Actions 的 job log 需要 repo admin 權限才讀得到，一開始只能盲猜，連錯三輪。後來改成把 npm 的輸出用 `::error::` 寫成 **annotation**——annotation 走公開 API 就讀得到，一次就看到真正的錯誤訊息。這段診斷程式碼留在 workflow 裡，之後 CI 出問題可以直接看。

第一次抓錯方向抓了輸出**尾段**，結果只拿到 npm 的使用說明；錯誤訊息在**開頭**。

### 線上驗證

| 檢查                                                                        | 結果                                                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `/`、`/article/1`～`/article/12`、`/example`、`/about`、`/login`、`/result` | 全部 200                                                     |
| 首頁                                                                        | 標題、文章卡片、圖片路徑（`/veekend-claude/images/...`）正確 |
| 文章頁 week1                                                                | 五種版面、內文圖片、YouTube、目錄錨點都在                    |
| 靜態資源                                                                    | 圖片、logo、favicon、`_nuxt/*.js` 全部 200                   |

### 待確認／未完成

- 搜尋結果、關於、登入、編輯頁仍是 `PagePlaceholder`
- GAS 端未建，資料仍讀專案內的 `articles.json`
- login 權限模型仍未拍板

Total cost: $53.97
Total duration (API): 1h 4m 9s
Total duration (wall): 4h 9m 1s
Total code changes: 2693 lines added, 70 lines removed
Usage by model:
claude-haiku-4-5: 1.8k input, 36 output, 0 cache read, 0 cache write ($0.0020)
claude-opus-5: 4.8k input, 288.3k output, 75.4m cache read, 903.3k cache write ($53.97)

### 下一步（Phase 7）

移植搜尋結果頁與關於頁：`legacy-app/result.html` + `js/result.js`、`about.html`。

---

## Phase 7 — 搜尋結果頁與關於頁（2026-08-18）

### 做了什麼

移植 `legacy-app/result.html` + `js/result.js` 與 `about.html`。順帶修掉一個 Phase 4 就存在、到這輪才發現的顯示 bug。

### 定案的決定

| 議題                  | 決定                                 |
| --------------------- | ------------------------------------ |
| 搜尋是否涵蓋內文      | parser 多輸出一欄純文字 `searchText` |
| `/result` 無 query 時 | 顯示全部文章，當成「全部文章」頁     |

### 搜尋

legacy 的搜尋直接對原始 HTML 字串做 `indexOf`，但 Phase 5 已經把 `content` 解析成 blocks，原始 HTML 不存在了。改法是讓 `scripts/parse-articles.mjs` 額外輸出 `searchText`——把 blocks 的文字攤平成一條純文字。

順帶修掉 legacy 的一個 bug：它會搜到 `class="articleStyle1"` 這類標記文字，新的索引只收真正的內容。

三種模式沿用 legacy 的 query 形式：

| query          | 行為                                           |
| -------------- | ---------------------------------------------- |
| `?tags=咖啡廳` | 精確比對 hashTags                              |
| `?all=台北市`  | 依縣市；「其他」＝台北市與新北市以外           |
| `?search=丸林` | 模糊比對縣市／區域／標題／摘要／**內文**／標籤 |

純靜態站的 query 只有 client 端拿得到，所以結果區包在 `<ClientOnly>` 裡（搜尋結果本來也不需要 SEO）。

驗證（對真實資料跑過）：`all=台北市` 4 篇、`all=新北市` 6 篇、`all=其他` 2 篇（基隆市＋屏東縣）、`tags=咖啡廳` 2 篇、`search=丸林` 1 篇（命中內文景點名）、`search=xyz` 0 篇。

### 產出

| 檔案                                        | 說明                                      |
| ------------------------------------------- | ----------------------------------------- |
| `composables/pages/useArticleSearch.ts`     | 三種模式的篩選邏輯                        |
| `components/pages/result/ResultHeading.vue` | 關鍵字大標 + 命中篇數                     |
| `pages/result.vue`                          | 結果頁，client-only 渲染                  |
| `pages/about.vue`                           | 關於頁，照片後面的黑色方塊 + 黃色長條錯位 |
| `utils/common/text.ts`                      | `stripHtml()`                             |

`ArticleList` 從 `components/pages/index/` 搬到 `components/common/article/`（首頁與結果頁共用），加上 `pageSize`（0 = 全部顯示、不出 LOAD MORE）與 `emptyText` 兩個 prop。

### 抓到一個 Phase 4 就存在的 bug

用瀏覽器實際看 result 頁時發現，`db.json` 的 `title` 與 `briefing` 欄位裡夾雜行內 HTML，legacy 用 `innerHTML` 塞所以會渲染，我們用 `{{ }}` 插值就把標籤當**字面文字印出來**：

- week2 摘要：`去<strong>大同區</strong>的大稻埕晃晃`
- week4 標題：`其實想用泡泡攻擊路人<br>Bubbles are just for show!`
- week5 標題：`穿草鞋，爬草山<br>青年。壯遊。臺灣`

只有 3 筆、只用到 `<strong>` 與 `<br>`。修法是顯示處改 `v-html`（BaseCard、HeroCarousel、SiteAside、ArticleNav、文章頁標題與摘要），`<title>`、meta description、`alt` 則改用 `stripHtml()`。已寫成 CLAUDE.md 的一節。

**這個 bug 靜態產物看不出來**——HTML 裡就是那串字，要在瀏覽器裡看渲染結果才會發現。

### 驗證方式

result 頁整頁都是 client 端渲染，靜態產物驗證不到，所以起了本地預覽伺服器用瀏覽器實際跑：

- `?search=丸林` → 1 篇，title 動態變成「丸林 | Veekend」
- `?all=其他` → 2 篇（基隆、屏東）
- `/result` 無 query → 12 篇全出
- `/article/4` → 標題正確斷行、內文完整、Next Post 的 week5 標題也正確斷行
- console 無錯誤與 hydration 警告

### 待確認／未完成

- 登入頁與文章編輯頁仍是 `PagePlaceholder`（權限模型未拍板）
- GAS 端未建，資料仍讀專案內的 `articles.json`

Total cost: $74.10
Total duration (API): 1h 12m 7s
Total duration (wall): 4h 37m 18s
Total code changes: 3045 lines added, 85 lines removed
Usage by model:
claude-haiku-4-5: 1.8k input, 36 output, 0 cache read, 0 cache write ($0.0020)
claude-opus-5: 5.0k input, 318.5k output, 103.3m cache read, 1.4m cache write ($74.10)

### 下一步

剩下 `login.html` 與 `articleEdit.html`。這兩頁卡在同一個未決事項：純靜態站做不了真正的身分驗證，legacy 的假登入（明文密碼放 db.json）不可照抄。要先決定權限模型才能動工。

---

## Phase 8 — Google Sheets + GAS 資料庫（2026-08-18）

### 成果

**網站的資料現在來自 Google 試算表。** 更新內容只要編試算表 → 到 Actions 手動觸發 workflow → 約兩分鐘後上線，不用碰程式碼、不用 push。

### 定案的決定

| 議題 | 決定 |
|---|---|
| 資料放哪 | 全部進 Sheets，可多開幾張表 |
| 讀取時機 | build 時直接抓 GAS |
| API 範圍 | 讀取加寫入 |
| 未完成的 week 7–12 | 繼續顯示（`published` 填 `TRUE`） |

### Schema：四張表，`week` 當關聯鍵

| 表 | 列數 | 內容 |
|---|---|---|
| `articles` | 12 | 一列一篇。`hashTags` 逗號分隔，新增 `published` 旗標 |
| `destinations` | 29 | 一列一景點。`local[緯度,經度]` 拆成 `lat` / `lng` 兩欄 |
| `blocks` | 56 | 一列一個內文區塊（`section` / `gallery`） |
| `parts` | 199 | 一列一個區塊內元素（7 種 `kind`） |

**刻意不存的兩樣東西**：文章目錄（可從「有 `anchorId` 的 section 的 h4 標題」推導）、搜尋索引（建置時由 `parts` 攤平）。少兩張表要維護。

### 怎麼確定搬過去不會掉資料

寫了 `npm run sheets:verify`：`articles.json` → CSV → 從 CSV 完整重建 → **逐欄比對**。12 篇全過才算數。

部署後又做了第二次驗證：拿 GAS 的實際回傳跟本地資料比對，6 篇（後來 12 篇）逐欄一致。兩次都證明整條管線無損。

### 順帶修掉的資料問題

- **拿掉 `id` 欄位**——它永遠等於 `week`，而且程式碼從未使用
- **week 1 的目錄有錯字**——目錄寫「丸林**魯**肉飯」、內文寫「丸林**滷**肉飯」。改成推導後自動統一，`parse-articles.mjs` 也改用同一套推導邏輯，兩條路徑不再分歧

### 產出

| 檔案 | 說明 |
|---|---|
| `scripts/export-sheets.mjs` | `npm run sheets:export`，產生四份可直接匯入的 CSV（含 BOM，中文不亂碼） |
| `scripts/build-from-rows.mjs` | 四張表 → `Article[]` 的組裝邏輯 |
| `scripts/verify-sheets-schema.mjs` | `npm run sheets:verify`，證明 schema 無損 |
| `gas/Code.gs` | `doGet` 讀取、`doPost` 寫入、金鑰存在指令碼屬性、`LockService` 防併發 |
| `docs/gas-setup.md` | 十步驟設定教學，含欄位定義與疑難排解 |
| `ArticleService` | 改為建置時打 GAS，沒設定就退回專案內的 `articles.json` |

⚠ `gas/Code.gs` 的 `rebuildArticles()` 與 `scripts/build-from-rows.mjs` 是同一套邏輯的兩份實作（GAS 不支援 ES module import），兩邊都加了註記提醒同步修改。

### 兩個我自己犯的錯

**1. `published` 預設值設錯。** 匯出時用「內文是空的」判斷，把 week 7–12 標成 `FALSE`，網站會從 12 篇變 6 篇。但那 6 篇的「未完成 / 努力趕稿中」是 legacy 刻意展示的頁面，不是草稿。已改成一律匯出 `TRUE`，該欄留給真正不想公開的草稿。

**2. 建置防護根本沒生效——這個比較嚴重。**

原本在 `ArticleService` 裡對建置階段 `throw`，以為抓不到資料就會讓 `nuxt generate` 失敗。實測用無效網址建置，結果是：

- 建置**回報成功**
- 路由數從 36 悄悄掉到 12
- 文章頁全部消失

原因是 **`useAsyncData` 會把錯誤收進 `error` ref 而不是往外拋**，service 裡的 `throw` 到不了外面。如果沒測就上線，會部署出一個看起來正常、內容卻大半不見的網站。

改成在 `useArticles()` 主動檢查 `error.value`，並在資料為空時一併擋下，以 `createError({ fatal: true })` 中斷 prerender。

三種情境都實測：

| 情境 | 結果 |
|---|---|
| GAS 正常 | 36 routes |
| GAS 網址無效 | 建置中斷，離開碼 1，訊息指出讀不到文章資料 |
| 未設定 GAS | 退回本地備份，36 routes |

### 線上驗證

- 12 個文章頁全部 200，首頁列表 12 筆齊全
- week 12 正確顯示「趕稿中」
- payload 含 `published` 欄位，證實資料走 GAS 而非本地備份

### 待確認／未完成

- **`doPost` 尚未接到前端**：純靜態站的 API 金鑰必然外洩（要能送請求就得存在瀏覽器裡）。目前的金鑰擋得住隨機掃描，擋不住開開發者工具的人。兩條替代做法寫在 `docs/gas-setup.md` 最後
- 登入頁與文章編輯頁仍是 `PagePlaceholder`

### 下一步

剩下 `login.html` 與 `articleEdit.html`，兩者卡在同一個決定：純靜態站做不了真正的身分驗證。要先拍板權限模型才能動工。

既然資料已經在 Sheets，「編輯直接在試算表做、網站不放編輯功能」也是完全合理的選項。
