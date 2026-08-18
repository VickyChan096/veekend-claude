export type AlertProps = Omit<Alert, 'id' | 'modelValue' | 'onCloseEvent'>

export type Alert = {
  id: string
  modelValue?: boolean
  title?: string
  text?: string
  closable?: boolean
  icon?: string
  type?: 'success' | 'info' | 'error'
  /** 是否自動關閉 */
  timer?: boolean
  onCloseEvent?: () => void
}
