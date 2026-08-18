<script lang="ts" setup>
import ExampleSection from '@/components/pages/example/ExampleSection.vue'
import ExampleRow from '@/components/pages/example/ExampleRow.vue'
import BaseButton from '@/components/common/button/BaseButton.vue'
import BaseLoading from '@/components/common/loading/BaseLoading.vue'
import { useAlert } from '@/composables/common/useAlert'
import { useDialog } from '@/composables/common/useDialog'
import { useFetchLoading } from '@/composables/common/useFetchLoading'

const open = defineModel<boolean>({ default: false })

const { openAlert } = useAlert()
const { openDialog } = useDialog()
const { wrap } = useFetchLoading()

const showAlert = (type: 'success' | 'info' | 'error') => {
  openAlert({
    type,
    title: type === 'error' ? '哇糟糕了' : '通知',
    text: type === 'error' ? '資料有誤，請通知管理員' : '這是一則提示訊息',
    timer: type !== 'error',
  })
}

const showDialog = () => {
  openDialog({
    title: '確定要刪除嗎？',
    text: '刪除後無法復原。',
    emphasizedText: '這個動作不可逆。',
    type: 'cancel',
    confirmText: '刪除',
    confirm: () => openAlert({ type: 'success', text: '已刪除', timer: true }),
  })
}

// 展示全域遮罩：用假的等待模擬一次請求
const showFetchLoading = () => {
  wrap(() => new Promise<void>((resolve) => setTimeout(resolve, 1200)))
}
</script>

<template>
  <ExampleSection
    v-model="open"
    title="提示與對話框"
    note="取代 legacy 的 SweetAlert。透過 useAlert() / useDialog() 呼叫，不用自己掛元件"
  >
    <ExampleRow label="BaseAlert">
      <BaseButton text="success" styling="secondary" @click="showAlert('success')" />
      <BaseButton text="info" styling="secondary" @click="showAlert('info')" />
      <BaseButton text="error" styling="secondary" @click="showAlert('error')" />
    </ExampleRow>

    <ExampleRow label="BaseDialog">
      <BaseButton text="開啟對話框" @click="showDialog" />
    </ExampleRow>

    <ExampleRow label="全域遮罩">
      <BaseButton text="模擬請求 1.2 秒" styling="secondary" @click="showFetchLoading" />
    </ExampleRow>

    <ExampleRow label="BaseLoading">
      <BaseLoading />
      <BaseLoading text="載入文章中" />
    </ExampleRow>
  </ExampleSection>
</template>
