/** 對話框關閉後把焦點還給觸發它的元素，避免鍵盤使用者迷失位置 */
export const focusTo = (id: string) => {
  if (!import.meta.client) return
  const element = document.getElementById(id)
  element?.focus()
}
