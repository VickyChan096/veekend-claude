/**
 * legacy 的日期一律是 "2019.10.20" 這種點分隔字串（db.json 裡甚至有 "2022.12.??"），
 * 所以格式轉換自己做，不引入 dayjs。
 */
export const toDotDate = (date: Date | null): string => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

/** 解析 "2019.10.20"；格式不完整（例如 "2022.12.??"）回傳 null */
export const fromDotDate = (value: string | null | undefined): Date | null => {
  if (!value) return null
  const matched = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value)
  if (!matched) return null
  const [, year, month, day] = matched
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}
