<script lang="ts" setup>
import { computed, ref, useId } from 'vue'
import FieldWrap from '@/components/common/form/FieldWrap.vue'
import BaseLabel from '@/components/common/form/BaseLabel.vue'
import { isRequired } from '@/utils/common/form/rules'
import { fromDotDate, toDotDate } from '@/utils/common/date/formatDate'

// 用 Vuetify 內建的 VDatePicker，不引入 flatpickr——legacy 也沒用到。
// v-model 對外是 "2019.10.20" 字串，與 db.json 的格式一致。
const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    errorMessages?: string | null
    hideDetails?: boolean
    max?: Date
    min?: Date
    invisibleLabel?: boolean
  }>(),
  {
    id: undefined,
    label: undefined,
    placeholder: '選擇日期',
    errorMessages: undefined,
    hideDetails: true,
    max: undefined,
    min: undefined,
    invisibleLabel: undefined,
  }
)

const model = defineModel<string | null>()
const innerId = ref(props.id ?? useId())
const menuOpen = ref(false)

const pickerValue = computed({
  get: () => fromDotDate(model.value),
  set: (date: Date | null) => {
    model.value = toDotDate(date)
    menuOpen.value = false
  },
})
const rules = computed(() => isRequired(props.required))
</script>

<template>
  <FieldWrap :label="label">
    <template #label>
      <BaseLabel
        v-if="label"
        :for="innerId"
        :label="label"
        :required="required"
        :invisible-label="invisibleLabel"
      />
    </template>
    <VMenu v-model="menuOpen" :close-on-content-click="false" location="bottom start">
      <template #activator="{ props: activatorProps }">
        <VTextField
          v-bind="activatorProps"
          :id="innerId"
          :model-value="model"
          :placeholder="placeholder"
          :disabled="disabled"
          :rules="rules"
          :error-messages="errorMessages ?? undefined"
          :hide-details="!errorMessages && hideDetails"
          prepend-inner-icon="mdi:calendar"
          variant="outlined"
          density="compact"
          color="primary"
          readonly
        />
      </template>
      <VDatePicker v-model="pickerValue" :max="max" :min="min" color="primary" show-adjacent-months />
    </VMenu>
  </FieldWrap>
</template>
