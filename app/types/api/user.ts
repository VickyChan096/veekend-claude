/**
 * 使用者模型。
 * ⚠ legacy 的 db.json 把明文密碼直接放在 users[]，純靜態站也做不了真正的驗證。
 * 這裡只保留可公開的欄位；登入與權限模型待決（見 CLAUDE.md 資料層段落）。
 */
export interface PublicUser {
  id: number
  name: string
}
