<script lang="ts" setup>
import { computed, ref, useId } from 'vue'
import FieldWrap from '@/components/common/form/FieldWrap.vue'
import BaseLabel from '@/components/common/form/BaseLabel.vue'
import { isRequired } from '@/utils/common/form/rules'
import type { OptionBase, SelectValue } from '@/types/common/form/OptionBase'

const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    placeholder?: string
    items: OptionBase<SelectValue>[]
    required?: boolean
    errorMessages?: string | null
    hideDetails?: boolean
    disabled?: boolean
    clearable?: boolean
    multiple?: boolean
    triggerBlurRule?: boolean
    inlineLabel?: boolean
    invisibleLabel?: boolean
  }>(),
  {
    id: undefined,
    label: undefined,
    placeholder: undefined,
    errorMessages: undefined,
    hideDetails: true,
    triggerBlurRule: true,
    inlineLabel: undefined,
    invisibleLabel: undefined,
  }
)

const model = defineModel<SelectValue | SelectValue[] | null>()
const innerId = ref(props.id ?? useId())
const touched = ref(false)

const placeholderText = computed(() => props.placeholder ?? (props.label ? `選擇${props.label}` : '請選擇'))
const rules = computed(() => (props.triggerBlurRule && !touched.value ? [] : isRequired(props.required)))
</script>

<template>
  <FieldWrap :label="label" :inline-label="inlineLabel">
    <template #label>
      <BaseLabel
        v-if="label"
        :for="innerId"
        :label="label"
        :required="required"
        :invisible-label="invisibleLabel"
      />
    </template>
    <VSelect
      :id="innerId"
      v-model="model"
      :items="items"
      item-title="text"
      item-value="value"
      :placeholder="placeholderText"
      :disabled="disabled"
      :clearable="clearable"
      :multiple="multiple"
      :rules="rules"
      :error-messages="errorMessages ?? undefined"
      :hide-details="!errorMessages && hideDetails"
      variant="outlined"
      density="compact"
      color="primary"
      menu-icon="mdi:chevron-down"
      @blur="touched = true"
    />
  </FieldWrap>
</template>
