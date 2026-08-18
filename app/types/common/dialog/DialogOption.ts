export type DialogProps = Omit<Dialog, 'id' | 'modelValue' | 'confirm' | 'cancel'>

export type Dialog = {
  id: string
  modelValue?: boolean
  title?: string
  ariaLabel?: string
  text?: string
  /** 需要被強調的片段，會以 primary 色顯示 */
  emphasizedText?: string
  type?: 'cancel' | 'save'
  width?: string
  maxWidth?: string
  persistent?: boolean
  closeButton?: boolean
  cancelText?: string
  confirmText?: string
  defaultButtons?: boolean
  /** 關閉後要把焦點還給哪個元素 */
  returnFocusId?: string
  confirm?: () => void
  cancel?: () => void
}
