/**
 * 下拉、單選、多選共用的選項格式。
 * 預設 value 為 string；要用 number 寫 `OptionBase<number>`，可為 null 寫 `OptionBase<number | null>`。
 */
export interface OptionBase<T extends SelectValue | null = string> {
  text: string
  value: T
}

export type SelectValue = number | string | boolean
