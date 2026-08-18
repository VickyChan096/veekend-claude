<script lang="ts" setup>
import FetchLoading from '@/components/common/loading/FetchLoading.vue'
import BaseAlert from '@/components/common/alert/BaseAlert.vue'
import BaseDialog from '@/components/common/dialog/BaseDialog.vue'
import { useAlert } from '@/composables/common/useAlert'
import { useDialog } from '@/composables/common/useDialog'
import { focusTo } from '@/utils/common/focusTo'
import type { Dialog } from '@/types/common/dialog/DialogOption'

// 全域掛載一次（在 app.vue），讓任何地方都能用 openAlert() / openDialog()。
const { alerts, closeAlert } = useAlert()
const { dialogs, closeDialog } = useDialog()

const dialogFinished = (dialog: Dialog) => {
  dialog.modelValue = false
  if (dialog.returnFocusId) focusTo(dialog.returnFocusId)
  // 等 Vuetify 的關閉動畫跑完再從清單移除
  setTimeout(() => closeDialog(dialog.id), 350)
}
const dialogCancel = (dialog: Dialog) => {
  dialog.cancel?.()
  dialogFinished(dialog)
}
const dialogConfirm = (dialog: Dialog) => {
  dialog.confirm?.()
  dialogFinished(dialog)
}
</script>

<template>
  <FetchLoading />
  <BaseAlert
    v-for="alert in alerts"
    :key="alert.id"
    v-bind="alert"
    v-model="alert.modelValue"
    @close-event="closeAlert(alert.id)"
  />
  <BaseDialog
    v-for="dialog in dialogs"
    :key="dialog.id"
    v-bind="dialog"
    v-model="dialog.modelValue"
    @cancel="dialogCancel(dialog)"
    @confirm="dialogConfirm(dialog)"
  />
</template>
