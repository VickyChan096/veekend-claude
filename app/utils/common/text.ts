/**
 * db.json 的 title 與 briefing 夾雜行內 HTML（`<br>` 斷行、`<strong>` 強調），
 * legacy 是用 innerHTML 塞進頁面所以會正常渲染。
 *
 * 顯示的地方用 v-html 還原設計；`<title>`、meta description、aria-label
 * 這類只吃純文字的位置，改用這個函式去掉標籤。
 */
export const stripHtml = (value: string | null | undefined): string =>
  (value ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
