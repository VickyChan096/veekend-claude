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
| `article.html` / `article6.html` + `js/article.js` | `pages/article/[id].vue`（`article6` 是完整內容範例，以它為準） |
| `articleEdit.html` | `pages/article/edit.vue` |
| `about.html` / `login.html` / `result.html` | 同名 page |
| `js/layout.js` + `js/aside.js` | `layouts/default.vue` + `components/layouts/` |
| `css/_variable.scss` `_mixin.scss` | 併入 `app/assets/scss/preprocess.scss` |
| `css/_reset.scss` `_layout.scss` | `app/assets/scss/main.scss` |
| `css/_aside.scss` `_articleList.scss` | 搬進對應元件的 `<style scoped lang="scss">` |
| jQuery DOM 操作 | 宣告式綁定 |
| Swiper | `v-carousel` |
| SweetAlert（`js/common.js` 的 `errAlert`） | `v-dialog` / `v-snackbar` |
| Fancybox | `v-overlay` |
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

## 現況

基礎建設與共用元件庫已完成（Phase 2、3）。`nuxt generate`、`npm run check`、`npm run lint` 皆通過。

已就緒：
- `nuxt.config.ts`——SSG（`nitro.preset: 'github_pages'`）、`app.baseURL` 由 `NUXT_APP_BASE_URL` 控制、顯式 import 全關、Vuetify plugin、SCSS 全域注入
- `app/assets/scss/`——`preprocess.scss`（色票 map、六階 typography mixin、斷點）、`_theme.scss`（CSS 變數輸出，含深色模式）、`main.scss`、`_reset.scss`
- `app/plugins/`——`vuetify.ts`（veekend 淺色／深色主題）、`globalStores.ts`（alert / dialog / fetchLoading / theme）
- `app/composables/common/`——`useAlert`、`useDialog`、`useFetchLoading`、`useThemeMode`
- `app/components/common/`——30 個共用元件，涵蓋表單（含驗證）、按鈕、卡片、對話框、輪播、燈箱、地圖、表格等
- `app/pages/example.vue`——元件庫展示頁，9 個展示區塊
- `app/types/`——`Article` / `Destination`（依 `db.json`）、`OptionBase`、`Alert`、`Dialog`、`BreadcrumbsItem`
- `app/services/ServiceBase.ts`——GAS 讀寫基底

尚未處理：
- 各頁面的實際重構（Phase 4 起，從首頁開始）
- `layouts/default.vue` 還是空殼，legacy 的 header / footer / aside 尚未移植
- `NUXT_PUBLIC_GAS_API_URL` 尚未有值，GAS 端也還沒建
- `app.baseURL` 的正式值待定（GitHub Pages repo 名稱尚未決定，目前預設 `/`）
- `BaseMap` 的圖磚來源仍是 MapLibre demotiles，需換正式來源
- legacy 的 `_layout.scss`（597 行）大部分尚未移植，隨頁面重構逐步搬移
