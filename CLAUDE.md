# Veekend 重構專案 — 開發約定

把 `../legacy-app/`（jQuery + 靜態 db.json 的多頁式網站）重構成本 Nuxt 專案，SSG 輸出到 GitHub Pages。

慣例一律對齊 `D:\2026\2025_NPS_NatureDB\002_View`——那是同一套寫法的成熟範例。設定或目錄結構有疑問時，先去看它怎麼寫。

> **本專案只有 Vicky 一人開發。** 文件與註解裡不要出現其他人名或代稱。
> **動手前先問。** 不確定的地方（選型、範圍、設計取捨）一次問完再實作，不要邊做邊猜。
> **參考來源分工：** `../legacy-app/` 只參考**設計**；專案結構、元件切法、程式寫法一律依照 `D:\2026\2025_NPS_NatureDB\002_View`。

## 技術棧

| 項目 | 決定 |
|---|---|
| 框架 | Nuxt 4（`app/` 目錄結構），SSG：`nuxt generate` |
| 語言 | TypeScript strict |
| UI | Vuetify 3，用 `vite-plugin-vuetify`（**不是** `vuetify-nuxt-module`）+ `build.transpile: ['vuetify']` |
| 樣式 | Scoped SCSS；全域變數走 `vite.css.preprocessorOptions.scss.additionalData` 注入 |
| 地圖 | MapLibre GL（legacy 的 Leaflet 全部改寫） |
| 圖示 | `@nuxt/icon` + `mdi`（取代 Font Awesome） |
| 資料 | Google Apps Script 讀寫 Google Sheets |
| 模組 | `@nuxt/eslint`、`@nuxt/fonts`、`@nuxt/icon`、`@nuxt/image` |

目前 `package.json` 裡的 `@nuxt/content`、`@nuxt/a11y`、`better-sqlite3` 與本案無關，確認不用就移除。

## 硬規則

1. **顯式 import**：`imports.autoImport: false`、`components: { dirs: [], global: false }`。所有 composable、元件、工具函式都自己 import，不靠自動註冊。
2. **一律 `<script setup lang="ts">`**，不用 Options API。
3. **不准 `any`**。型別定義放 `app/types/`。
4. **瀏覽器相依的東西包 `<ClientOnly>` 或動態 import**——MapLibre GL、任何碰 `window` / `document` 的邏輯。`nuxt generate` 在 Node 跑，漏一個就 build 失敗。
5. **元件不直接打 API**。對外請求集中在 `app/services/`，元件透過 composable 取用。
6. **GitHub Pages 子路徑**：資源與連結一律走 `app.baseURL`（`<NuxtLink>`、`<NuxtImg>`、`useRuntimeConfig().app.baseURL`），不要寫死 `/`。
7. **SCSS partial 要自己 `@use`**——`vite.css.preprocessorOptions.additionalData` 只注入 Vite 的進入點（`main.scss`、各 `.vue` 的 `<style lang="scss">`），**不會**傳遞到被 `@use` 進來的 partial。partial 裡要用變數或 mixin，開頭自己寫 `@use 'preprocess' as *;`。

## 目錄結構

```
app/
  assets/{images,scss}    main.scss 進 nuxt.config 的 css[]；preprocess.scss 全域注入
  components/{common,layouts,pages}
  composables/{common,pages}
  constants/
  layouts/
  pages/
  plugins/
  services/               GAS 請求都在這
  types/{common,pages,api}
  utils/
```

`components` / `composables` / `types` 內部再依 `common / layouts / pages` 分層，與 002_View 一致。型別放 `app/types/`，不是根目錄 `types/`。

## 資料層

- 來源：GAS web app endpoint，背後是 Google Sheets。URL 走 `runtimeConfig.public`，不寫死。
- **讀取在 build 時靜態化**：列表與單篇文章用 `useAsyncData`，`nuxt generate` 時抓完寫進靜態頁，兼顧 SEO 與載入速度。內容更新＝重新部署。
- **寫入走 client 端**：`articleEdit` 的送出直接 POST 到 GAS（純靜態站沒有自己的 server）。
- `../legacy-app/dataBase/db.json` 是資料結構的權威樣本，建 `app/types/` 時以它為準（`articles[]`、`destinations[]`、`users[]`）。
- ⚠ legacy 的 `login.html` 是把明文密碼放在 db.json 的假登入。純靜態站做不了真正的驗證——**不要照抄**，登入與編輯的權限模型要另外決定。

## legacy → Nuxt 對照

| legacy | 對應 |
|---|---|
| `index.html` + `js/index.js` | `pages/index.vue`（首頁輪播、文章列表、load more） |
| `article.html` + `js/article.js` | `pages/article/[week].vue`（內文已解析成區塊，見「文章內文」段落） |
| `articleEdit.html` | `pages/article/edit.vue` |
| `about.html` / `login.html` / `result.html` | 同名 page（尚未重構，目前是 `PagePlaceholder`） |
| `js/layout.js` + `js/aside.js` | `layouts/default.vue` + `components/layouts/` |
| `css/_variable.scss` `_mixin.scss` | 併入 `app/assets/scss/preprocess.scss` |
| `css/_reset.scss` `_layout.scss` | `app/assets/scss/main.scss` |
| `css/_aside.scss` `_articleList.scss` | 搬進對應元件的 `<style scoped lang="scss">` |
| jQuery DOM 操作 | 宣告式綁定 |
| Swiper | `BaseCarousel`（v-carousel） |
| SweetAlert（`js/common.js` 的 `errAlert`） | `v-dialog` / `v-snackbar` |
| Fancybox | `BaseLightbox`（v-overlay） |
| Leaflet | MapLibre GL，包在 `<ClientOnly>` |
| axios + `$.ajax` | `$fetch` / `useAsyncData` |

附屬套件的原則：**能用 Vuetify 就用 Vuetify**，不再引入 legacy 那批 CDN 套件。

## 每個元件的重構步驟

1. 讀 `../legacy-app/` 對應的 HTML / SCSS / JS。
2. 抽出反應式狀態成 `ref` / `reactive` / `computed`，DOM 操作換成宣告式綁定。
3. 先在 `app/types/` 定好 props 與資料模型，再寫元件。
4. 拆成單一職責元件放 `app/components/pages/<page>/`；跨頁共用的放 `common/`。
5. 收尾跑 typecheck 與 lint。

## 例行公事：Phase 收尾

工作以編號 phase 推進。每個 phase 結束時，AI 必須主動做完這三件事，不必等 Vicky 開口：

1. **更新 `NOTE.md`**——在總覽表加一列，並補上該 phase 的詳細段落（做了什麼、關鍵決定、產出、待確認事項）。Token 與費用欄位**留空**。
2. **提醒 Vicky 執行 `/cost`**，把數字填進 `NOTE.md`。AI 讀不到計費資料，**不要代填估算值**。
3. **給一份可直接複製的 markdown 總結**，方便 Vicky 貼進自己的筆記本。

## 共用元件庫

`app/components/common/` 底下依用途分資料夾，一個資料夾一類元件（`button/`、`input/`、`dialog/`…），命名一律 `Base*`。

- **外觀變體用 `styling` prop，不要為了換顏色開新元件**（`styling="primary" | "secondary" | "text"`）。
- **樣式吃 CSS 變數與 typography mixin**：`var(--primary)`、`@include body1-regular`。不要寫死色碼或 px 字級。
- **提示與對話框不要自己掛元件**：`GlobalComponents.vue` 已在 `app.vue` 掛好，用 `useAlert().openAlert()`、`useDialog().openDialog()`、`useFetchLoading().wrap()` 呼叫。
- **`ariaLabel` 這個 prop 名稱會與原生 `aria-label` 撞名**，vue-tsc 認不出來。需要必填的無障礙標籤時，prop 叫 `label`（見 `BaseIconButton`）。
- **新增或改動共用元件，同一輪要在 `pages/example.vue` 補上展示**。那頁是唯一能一眼看完所有元件的地方，漏掉就等於沒人知道它存在。
- Example page 的示範連結**只能指向已存在的路由**——`nuxt generate` 的 crawler 會跟著爬，連到不存在的頁面會讓建置失敗。

深色模式：`useThemeMode()` 同時切 Vuetify 主題與 `<html data-theme>`，前者管 Vuetify 元件、後者管 `_theme.scss` 的 CSS 變數。改色票要**同時**改 `preprocess.scss` 的 `$theme-light` / `$theme-dark` 與 `plugins/vuetify.ts` 的兩組 theme。

## 文章內文

內文不是 HTML 字串——`db.json` 的 `content` 已由 `npm run data:parse`（`scripts/parse-articles.mjs`）解析成 `blocks[]`，成品在 `app/assets/data/articles.json`。

- **改內文要重跑 `npm run data:parse`**，不要手改 `articles.json`
- 區塊模型定義在 `app/types/api/articleContent.ts`；新增版型時同時改型別、腳本、`ArticleSection.vue`
- 只有段落與清單項目保留行內 HTML（`<a>` `<u>` `<mark>` `<br>`），其餘一律走元件
- 腳本遇到不認得的版型 class 會印警告並略過——跑完要看輸出有沒有警告

## 部署

**站台：https://vickychan096.github.io/veekend-claude/**（repo `VickyChan096/veekend-claude`）

push 到 `main` 就由 `.github/workflows/deploy.yml` 自動建置並發布。

- workflow 用 `NUXT_APP_BASE_URL: /${{ github.event.repository.name }}/` 自動組出子路徑，**改名或搬 repo 都不用改設定**
- 建置前跑 `npm run check`（typecheck），失敗就不部署
- actions 一律用 v5——v4 是為 Node 20 寫的，runner 會強制它跑在 Node 24 上
- 本機重現正式建置：複製 `.env.example` 成 `.env.production` 填好 `NUXT_APP_BASE_URL`，跑 `npm run generate:gh`

踩過的坑：

- ⚠ **動過相依之後要重建 `package-lock.json`**。在 Windows 上多輪 `npm uninstall` / `npm install` 會讓 lock 漏掉只有 Linux 需要的套件（`@emnapi/*`、`@parcel/watcher`），**本機 `npm ci` 一路綠燈但 CI 秒炸**（EUSAGE / Missing from lock file）。解法是刪掉 `node_modules` 與 `package-lock.json` 重跑 `npm install`
- ⚠ **CI 的 job log 需要 repo admin 權限**才讀得到。workflow 裡的 `Install dependencies` 會把 npm 輸出用 `::error::` 寫成 annotation，那個走公開 API 就讀得到——CI 出問題先看 annotation，不要盲猜
- ⚠ **不要在 Git Bash 用行內環境變數**：`NUXT_APP_BASE_URL=/x/ npm run generate` 會被 MSYS 的 POSIX 路徑轉換改寫成 `C:/Program Files/Git/x/`，建置**回報成功**但每頁只產出 `"Redirecting..."`。要嘛加 `MSYS_NO_PATHCONV=1`，要嘛走 `--dotenv`（讀檔不經過 shell）
- ⚠ **`public/` 底下的資源路徑不會自動補 baseURL**。資料裡帶路徑的圖片（例如 `largeCoverUrl`）一律經過 `useAssetUrl()`
- ⚠ **prerender 的 crawler 會跟著站內連結爬**。連到不存在的路由會讓建置失敗，所以還沒重構的頁面要先用 `PagePlaceholder` 佔住路由
- ⚠ **圖示要進 client bundle**：`icon.clientBundle.scan` 只掃得到原始碼裡寫死的名稱，Vuetify 執行期才從 alias 取的圖示掃不到，要在 `nuxt.config.ts` 的 `VUETIFY_ICONS` 點名

## 現況

Phase 1–6 完成：基礎建設、共用元件庫、首頁與 layout、文章頁、部署上線。`nuxt generate`、`npm run check`、`npm run lint` 皆通過。

已就緒：
- 設定與樣式基礎——SSG、深色模式、design token、六階 typography mixin
- `app/components/common/`——30 個共用元件；`app/pages/example.vue` 為展示頁
- `app/components/layouts/`——HeaderBar、FooterBar、ScrollToTopButton、SiteAside
- `app/pages/index.vue`——輪播、文章列表（LOAD MORE）、景點地圖、側欄
- `app/pages/article/[week].vue`——hero、結構化內文、燈箱、本週地圖、上下篇導覽
- 資料層——`ArticleService`（讀 `app/assets/data/articles.json`）、`useArticles()`
- 內文解析——`npm run data:parse` 由 `db.json` 產生 `articles.json`，改內容要重跑
- 資產——`public/images/`（132 檔）

尚未處理：
- 搜尋結果與關於頁（Phase 6）、登入與編輯頁（Phase 7）——目前都是 `PagePlaceholder`
- GAS 端未建，`NUXT_PUBLIC_GAS_API_URL` 無值
- `app.baseURL` 正式值待定（repo 名稱未決）
- login 權限模型待決
