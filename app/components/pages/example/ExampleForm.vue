<script lang="ts" setup>
import { ref } from 'vue'
import ExampleSection from '@/components/pages/example/ExampleSection.vue'
import ExampleRow from '@/components/pages/example/ExampleRow.vue'
import BaseInput from '@/components/common/input/BaseInput.vue'
import PasswordInput from '@/components/common/input/PasswordInput.vue'
import BaseTextarea from '@/components/common/textarea/BaseTextarea.vue'
import BaseSelect from '@/components/common/select/BaseSelect.vue'
import BaseDatepicker from '@/components/common/date/BaseDatepicker.vue'
import BaseCheckbox from '@/components/common/checkbox/BaseCheckbox.vue'
import BaseCheckboxGroup from '@/components/common/checkbox/BaseCheckboxGroup.vue'
import BaseRadioGroup from '@/components/common/radio/BaseRadioGroup.vue'
import type { OptionBase, SelectValue } from '@/types/common/form/OptionBase'

const open = defineModel<boolean>({ default: false })

const text = ref<string | number | null>('')
const email = ref<string | number | null>('')
const password = ref<string | null>('')
const briefing = ref<string | null>('')
const city = ref<SelectValue | SelectValue[] | null>(null)
const visitedDate = ref<string | null>('2019.10.20')
const agreed = ref(false)
const tags = ref<SelectValue[]>([])
const rateType = ref<SelectValue | null>('food')

const cities: OptionBase<SelectValue>[] = [
  { text: '台北市', value: 'taipei' },
  { text: '新北市', value: 'newTaipei' },
  { text: '屏東縣', value: 'pingtung' },
]
const tagItems: OptionBase<SelectValue>[] = [
  { text: '美食', value: 'food' },
  { text: '展覽', value: 'exhibition' },
  { text: '戶外', value: 'outdoor' },
]
</script>

<template>
  <ExampleSection
    v-model="open"
    title="表單"
    note="required 的欄位會在失焦後才跳驗證訊息（triggerBlurRule 預設 true）"
  >
    <div class="form-grid">
      <BaseInput v-model="text" label="標題" required :hide-details="false" :maxlength="40" />
      <BaseInput v-model="email" label="Email" type="email" :hide-details="false" hint="會用來寄送通知" />
      <PasswordInput v-model="password" required />
      <BaseSelect v-model="city" label="縣市" :items="cities" required :hide-details="false" clearable />
      <BaseDatepicker v-model="visitedDate" label="造訪日期" required :hide-details="false" />
      <BaseTextarea v-model="briefing" label="摘要" :rows="3" :maxlength="100" counter :hide-details="false" />
    </div>

    <ExampleRow label="checkbox / radio">
      <BaseCheckbox v-model="agreed" label="我同意將這篇文章公開" />
    </ExampleRow>
    <ExampleRow>
      <BaseCheckboxGroup v-model="tags" label="標籤" :items="tagItems" inline />
    </ExampleRow>
    <ExampleRow>
      <BaseRadioGroup v-model="rateType" label="主要類型" :items="tagItems" inline />
    </ExampleRow>

    <pre class="form-state">{{
      JSON.stringify({ text, email, city, visitedDate, agreed, tags, rateType }, null, 2)
    }}</pre>
  </ExampleSection>
</template>

<style lang="scss" scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }
}
.form-state {
  @include body2-regular;
  padding: 12px;
  overflow-x: auto;
  color: var(--subtitle);
  background-color: var(--container);
  border-radius: var(--border-radius-s);
}
</style>
