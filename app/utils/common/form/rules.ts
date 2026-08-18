export type ValidationRule = (value: number | boolean | string | null | undefined | []) => true | string

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const urlPattern = /^https?:\/\/.+/

export function isRequired(enabled = true): ValidationRule[] {
  if (!enabled) return []
  return [
    (value) => {
      if (Array.isArray(value)) return value.length > 0 ? true : '必填'
      if (value === 0) return true
      return value ? true : '必填'
    },
  ]
}

export function isEmail(enabled = true): ValidationRule[] {
  if (!enabled) return []
  return [(value) => (!value || emailPattern.test(String(value)) ? true : 'Email 格式不正確')]
}

export function isUrl(enabled = true): ValidationRule[] {
  if (!enabled) return []
  return [(value) => (!value || urlPattern.test(String(value)) ? true : '網址需以 http:// 或 https:// 開頭')]
}

export function maxLength(max: number): ValidationRule[] {
  return [(value) => (!value || String(value).length <= max ? true : `不可超過 ${max} 字`)]
}
