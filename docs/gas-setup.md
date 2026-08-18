# Google Sheets + GAS 資料庫設定

把 veekend 的文章資料放進 Google 試算表，用 Apps Script 做成 API，網站在建置時抓取。

照著做大約 20 分鐘。每一步做完都有可以驗證的東西，不用一路做到底才知道對不對。

---

## 資料表結構

四張工作表。`week` 是所有表的關聯鍵。

### `articles` — 一列一篇

| 欄位 | 型別 | 範例 | 說明 |
| --- | --- | --- | --- |
| `week` | 數字 | `1` | 主鍵，也是網址 `/article/1` |
| `title` | 文字 | `ORION BEER FEST...` | 可含 `<br>`（斷行）與 `<strong>`（強調） |
| `city` | 文字 | `台北市` | |
| `district` | 文字 | `中山區` | |
| `visitedDate` | 文字 | `2019.10.20` | 點分隔，不要讓 Sheets 自動轉成日期格式 |
| `writtenDate` | 文字 | `2022.10.18` | 允許 `2022.12.??` 這種不完整值 |
| `userName` | 文字 | `VC` | |
| `briefing` | 文字 | 摘要 | 列表頁與 meta description 用 |
| `largeCoverUrl` | 文字 | `images/week1/cover.jpg` | 相對於 `public/` |
| `smallCoverUrl` | 文字 | `images/week1/cover-s.jpg` | 側欄小圖 |
| `hashTags` | 文字 | `花博公園,中山區,台北市` | 逗號分隔 |
| `published` | 文字 | `TRUE` / `FALSE` | `FALSE` 的文章不會出現在網站上。**未完成但要展示的文章仍填 `TRUE`**，這欄是給不想公開的草稿用的 |

### `destinations` — 一列一個景點

| 欄位 | 型別 | 範例 | 說明 |
| --- | --- | --- | --- |
| `week` | 數字 | `1` | 屬於哪一篇 |
| `order` | 數字 | `1` | 同一篇內的排序 |
| `name` | 文字 | `丸林滷肉飯` | |
| `rate` | 數字 | `3.9` | 評分 |
| `mapUrl` | 文字 | Google Maps 網址 | |
| `lat` | 數字 | `25.06878` | 緯度 |
| `lng` | 數字 | `121.52490` | 經度 |

### `blocks` — 一列一個內文區塊

| 欄位 | 型別 | 值 | 說明 |
| --- | --- | --- | --- |
| `week` | 數字 | `1` | |
| `order` | 數字 | `1` | 區塊在文章裡的順序 |
| `type` | 文字 | `section` / `gallery` | |
| `layout` | 文字 | 見下表 | 只有 `section` 要填 |
| `anchorId` | 文字 | `dest1` | 選填。填了就會出現在文章開頭的目錄裡 |

`layout` 的五種值：

| 值 | 版面 |
| --- | --- |
| `imageLeft` | 圖左文右（景點介紹用） |
| `imageRight` | 文左圖右 |
| `imageFirst` | 全寬圖在上、文字在下 |
| `textFirst` | 文字在上、全寬圖在下 |
| `video` | 影片區塊 |

### `parts` — 一列一個區塊內的元素

| 欄位 | 說明 |
| --- | --- |
| `week` | |
| `blockOrder` | 屬於哪個區塊（對應 `blocks.order`） |
| `order` | 在區塊內的順序 |
| `kind` | 元素種類，見下表 |
| `level` | 只有 `heading` 要填：`4` 景點名、`5` 小標、`6` 評分 |
| `heading` | 只有 `galleryItem` 要填 |
| `text` | 依 `kind` 而定，見下表 |
| `imageSrc` | 版面上顯示的圖 |
| `imageFullSrc` | 燈箱要開的大圖，留空就用 `imageSrc` |
| `imageAlt` | 圖片替代文字 |
| `imageCaption` | 圖片說明 |

`kind` 的七種值：

| `kind` | `text` 放什麼 | 其他要填的欄位 |
| --- | --- | --- |
| `heading` | 標題文字 | `level` |
| `list` | 每個項目一行（儲存格內按 `Alt+Enter` 換行） | |
| `paragraph` | 段落，可含 `<a>` `<u>` `<mark>` | |
| `image` | — | `imageSrc` 等 |
| `imageText` | 疊在圖片上方的說明 | `imageSrc` 等 |
| `video` | YouTube 嵌入網址 | |
| `galleryItem` | 說明文字 | `heading`、`imageSrc` 等 |

### 不用建的東西

- **文章開頭的目錄**：由「有填 `anchorId` 的 `section` 的 `level=4` 標題」自動產生
- **搜尋索引**：建置時自動從 `parts` 攤平

---

## 步驟

### 1. 產生要匯入的 CSV

```bash
npm run sheets:export
```

會在 `scripts/sheets-export/` 產生四個檔：`articles.csv`、`destinations.csv`、`blocks.csv`、`parts.csv`。

先確認資料轉得對：

```bash
npm run sheets:verify
```

看到 `✅ schema 無損` 才往下做。

### 2. 建立試算表

1. 開 https://sheets.new
2. 命名為 `veekend-data`（名字隨意，記得就好）
3. 左下角把預設的「工作表1」改名為 **`articles`**
4. 再新增三張工作表，分別命名 **`destinations`**、**`blocks`**、**`parts`**

工作表名稱要完全一致（全小寫、無空白），程式是照名字找的。

### 3. 匯入四個 CSV

**每一張表都要單獨匯入一次**，共四次：

1. 點到 `articles` 那張表
2. 選單 **檔案 → 匯入**
3. **上傳** 分頁，選 `scripts/sheets-export/articles.csv`
4. 匯入位置選 **「取代目前的工作表」**
5. 分隔符號選 **逗號**
6. **「將文字轉換為數字、日期和公式」選「否」** ← 這步很重要，選「是」的話 `2019.10.20` 會被轉成日期、`(02) 2597-7971` 會變成公式錯誤
7. 按「匯入資料」

其餘三張表重複同樣步驟。

匯完檢查：`articles` 12 列 + 表頭、`destinations` 29 列、`blocks` 56 列、`parts` 199 列。

### 4. 貼上 Apps Script 程式

1. 在試算表裡選單 **擴充功能 → Apps Script**
2. 把編輯器裡預設的 `function myFunction() {}` 全部刪掉
3. 把專案裡 `gas/Code.gs` 的內容整份貼進去
4. 左上角專案名稱改成 `veekend-api`
5. 按存檔（`Ctrl+S`）

### 5. 設定 API 金鑰

金鑰用來保護寫入，不寫在程式碼裡。

1. 左側齒輪 **專案設定**
2. 捲到最下面 **指令碼屬性 → 新增指令碼屬性**
3. 屬性填 `API_KEY`
4. 值填一段隨機字串，例如：

   ```
   veekend-2026-8f3a91c47b2e6d05
   ```

   自己改幾個字元，不要照抄。
5. 儲存

### 6. 先測試讀取

1. 回到編輯器，上方函式下拉選 **`testRead`**
2. 按 **執行**
3. 第一次會跳授權：選你的 Google 帳號 → 「進階」→「前往 veekend-api（不安全）」→ 允許
   （這是你自己寫的腳本，這個警告是 Google 對未驗證專案的通則）
4. 下方「執行記錄」應該出現：

   ```
   共 12 篇
   week 1：ORION BEER FEST in TAIPEI 一起狂喝一整晚!｜景點 2｜區塊 6｜發佈 true
   ...
   ```

數字對得上就代表試算表結構讀得正確。**這步不過不要往下做。**

### 7. 部署成 Web App

1. 右上角 **部署 → 新增部署作業**
2. 齒輪選 **網頁應用程式**
3. 說明填 `v1`
4. **執行身分**：選「我」
5. **具有存取權的使用者**：選 **「所有人」**
   （文章是公開內容；寫入另外靠 API 金鑰擋）
6. 按 **部署**，複製「網頁應用程式」那條網址，長這樣：

   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

### 8. 用瀏覽器驗證 API

把網址直接貼到瀏覽器，應該看到 JSON：

```json
{"articles":[{"week":1,"userName":"VC",...}],"count":12}
```

`count` 是 12 就成功了。

> 如果只回 6 筆，代表 `articles` 表的 `published` 欄有 FALSE。那一欄是給草稿用的，
> 未完成但仍要展示的文章（week 7~12）要填 `TRUE`。

### 9. 接到專案

在專案根目錄建立 `.env`（這個檔不會進版控）：

```
NUXT_PUBLIC_GAS_API_URL=https://script.google.com/macros/s/你的ID/exec
```

然後：

```bash
npm run dev
```

首頁能正常顯示文章，就代表串起來了。

### 10. 讓 GitHub Actions 也拿得到

1. 到 repo 的 **Settings → Secrets and variables → Actions**
2. **New repository secret**
3. Name 填 `GAS_API_URL`
4. Secret 填同一條網址
5. 按 Add secret

workflow 已經設定好會讀這個 secret，不用改。

---

## 之後怎麼更新內容

1. 直接在 Google 試算表改
2. 到 repo 的 **Actions → Deploy to GitHub Pages → Run workflow** 手動觸發
3. 約兩分鐘後網站更新

改內容不需要動程式碼，也不需要 push。

---

## 重要限制：寫入的金鑰擋不住有心人

`doPost` 用 API 金鑰驗證，但**純靜態網站上的任何金鑰都會被使用者看到**——它必須存在瀏覽器的 JavaScript 裡才能送出請求。

所以目前的寫入 API：

- ✅ 擋得住隨機掃描與無意的誤觸
- ❌ 擋不住任何願意打開開發者工具的人

如果之後要在網站上做文章編輯功能，安全的做法有兩條：

1. **部署改成「只有我」**：GAS 部署設定的「具有存取權的使用者」改成限定你的 Google 帳號，寫入前要先用 Google 登入。缺點是讀取也會被鎖，得拆成兩個部署。
2. **編輯不放在網站上**：直接編試算表。既然資料已經在 Sheets，這其實是最省事的選項。

這件事跟還沒決定的登入權限模型是同一個問題，等要做編輯頁時一起決定。

---

## 疑難排解

| 症狀 | 原因與處理 |
| --- | --- |
| `testRead` 說找不到工作表 | 工作表名稱要完全是 `articles` / `destinations` / `blocks` / `parts`，全小寫、前後無空白 |
| 日期變成 `2019/10/20` | 匯入時「將文字轉換為數字、日期和公式」選成「是」了。把那欄格式設為「純文字」後重新匯入 |
| 電話號碼變成 `#ERROR!` | 同上，`(02) 2597-7971` 開頭的括號被當成公式 |
| API 回 `{"error":"unauthorized"}` | 只有帶 `includeUnpublished=1` 或 POST 才需要金鑰，檢查有沒有傳對 `apiKey` |
| 改了程式碼但 API 沒變 | Apps Script 要重新部署：**部署 → 管理部署作業 → 編輯（鉛筆）→ 版本選「新版本」→ 部署** |
| 網站建置失敗說抓不到資料 | 檢查 GitHub secret `GAS_API_URL` 有沒有設，以及部署的存取權是不是「所有人」 |
