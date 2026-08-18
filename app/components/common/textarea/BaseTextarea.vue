<script lang="ts" setup>
import { computed, ref, useId } from 'vue'
import FieldWrap from '@/components/common/form/FieldWrap.vue'
import BaseLabel from '@/components/common/form/BaseLabel.vue'
import { isRequired, maxLength } from '@/utils/common/form/rules'

const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    placeholder?: string
    required?: boolean
    errorMessages?: string | null
    hideDetails?: boolean
    disabled?: boolean
    rows?: number
    maxlength?: number
    counter?: boolean
    autoGrow?: boolean
    triggerBlurRule?: boolean
    invisibleLabel?: boolean
  }>(),
  {
    id: undefined,
    label: undefined,
    placeholder: undefined,
    errorMessages: undefined,
    hideDetails: true,
    rows: 4,
    maxlength: undefined,
    triggerBlurRule: true,
    invisibleLabel: undefined,
  }
)

const model = defineModel<string | null>()
const innerId = ref(props.id ?? useId())
const touched = ref(false)

const placeholderText = computed(() => props.placeholder ?? (props.label ? `輸入${props.label}` : '輸入'))
const rules = computed(() => {
  if (props.triggerBlurRule && !touched.value) return []
  return [...isRequired(props.required), ...(props.maxlength ? maxLength(props.maxlength) : [])]
})
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
    <VTextarea
      :id="innerId"
      v-model="model"
      :placeholder="placeholderText"
      :disabled="disabled"
      :rows="rows"
      :maxlength="maxlength"
      :counter="counter || undefined"
      :auto-grow="autoGrow"
      :rules="rules"
      :error-messages="errorMessages ?? undefined"
      :hide-details="!errorMessages && hideDetails"
      variant="outlined"
      density="compact"
      color="primary"
      @blur="touched = true"
    />
  </FieldWrap>
</template>
