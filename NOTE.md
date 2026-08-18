# Veekend 重構 — Phase 紀錄

每個 phase 收尾時更新本檔。Token 欄位由 Vicky 執行 `/cost` 後自行填入（AI 無法讀取計費資料，不要代填估算值）。

## 總覽

| Phase | 日期       | 內容                      | Tokens                    | 費用   |
| ----- | ---------- | ------------------------- | ------------------------- | ------ |
| 1     | 2026-08-18 | 專案調查與 CLAUDE.md 改寫 |                           |        |
| 2     | 2026-08-18 | 基礎建設                  | 1.7k input, 50.0k output  | $4.59  |
| 3     | 2026-08-18 | 共用元件庫與 Example page | 2.3k input, 137.7k output | $14.04 |
| 4     | 2026-08-18 | 首頁與 layout 移植        |                           |        |

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

- 本專案只有 Vicky 一人開發，文件與註解不出現其他人名或代稱（已把先前的 gaha 全數改掉）
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

| 檔案 | 對應 legacy | 說明 |
|---|---|---|
| `services/pages/ArticleService.ts` | `$.ajax` / `axios` 抓 db.json | 目前讀本地 JSON，換 GAS 只動這個檔 |
| `composables/pages/useArticles.ts` | 各頁重複的資料處理 | 用 `useAsyncData` 包，prerender 時抓完寫進 payload；另提供依縣市分組、hashTag 排行、景點去重 |
| `composables/common/useAssetUrl.ts` | — | 幫資料裡的圖片路徑補上 `app.baseURL` |
| `layouts/default.vue` | `js/layout.js` | Header + main + Footer + ScrollToTop |
| `components/layouts/HeaderBar.vue` | `createHeader()` | 黃底 fixed、logo、漢堡鍵、搜尋、三組縣市下拉選單 |
| `components/layouts/FooterBar.vue` | `createFooter()` | 灰階大圖、社群連結（黃色底線 hover）、版權 |
| `components/layouts/ScrollToTopButton.vue` | `#toTop` | 捲超過 200px 才淡入 |
| `components/layouts/SiteAside.vue` | `js/aside.js` | 頭像、社群、隨機三篇熱門、hashTag 前 10、廣告 |
| `components/pages/index/HeroCarousel.vue` | Swiper 區塊 | 改吃資料（原本三張硬編碼），parallax 用 CSS transition 近似 |
| `components/pages/index/ArticleList.vue` | `createArticleList()` | 用 BaseCard，一次 5 筆、LOAD MORE 往後追加 |
| `components/pages/index/DestinationMap.vue` | Leaflet 地圖 | MapLibre GL + OSM raster 圖磚，景點 marker 與 popup |
| `components/pages/PagePlaceholder.vue` | — | 未重構頁面的佔位 |
| `pages/{about,login,result}.vue`、`pages/article/[week].vue` | 同名 legacy 頁 | 佔位頁 |

### 為什麼要先建佔位頁

`nuxt generate` 的 crawler 會跟著站內連結爬，連到不存在的路由**會讓建置直接失敗**。header 選單與文章列表都連向 `/article/N`、`/result`、`/about`、`/login`，所以這四個路由必須先存在。副作用是 `/article/1`～`/article/12` 已經各自產生靜態頁，Phase 5 只要把內容填進去。

### 踩到的坑

**`NUXT_APP_BASE_URL` 這個環境變數名稱不能用。** 原本 `nuxt.config.ts` 寫 `baseURL: process.env.NUXT_APP_BASE_URL ?? '/'`，設值後 Nuxt 會把同名環境變數**再套用一次**，router base 與請求路徑對不起來，每個頁面都只 prerender 出 `"Redirecting..."`，36 個路由掉到 3 個且全是空殼。

診斷方式：把 baseURL 硬編碼成 `/veekend/` 重跑，41 個路由全部正常 → 確認是環境變數重複套用，不是 baseURL 機制本身的問題。

解法：改名為 `VEEKEND_BASE_URL`，並新增 `generate:gh` script 走 `--dotenv .env.production`（比照 002_View 的做法）。

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

### 下一步（Phase 5）

移植文章頁：`legacy-app/article6.html` + `js/article.js` → `pages/article/[week].vue`（內文、圖庫燈箱、景點地圖與評分）。
