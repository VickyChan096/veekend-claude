<script lang="ts" setup>
import { computed, ref, useId } from 'vue'
import FieldWrap from '@/components/common/form/FieldWrap.vue'
import BaseLabel from '@/components/common/form/BaseLabel.vue'
import { isEmail, isRequired, isUrl, maxLength } from '@/utils/common/form/rules'

const emit = defineEmits<{
  (e: 'focus' | 'blur', value: number | string | null | undefined): void
}>()
const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    placeholder?: string
    required?: boolean
    /** 由外部傳入的錯誤訊息（例如 API 回傳的） */
    errorMessages?: string | null
    hideDetails?: boolean
    disabled?: boolean
    clearable?: boolean
    prependInnerIcon?: string
    maxlength?: number
    type?: 'text' | 'number' | 'url' | 'password' | 'email' | 'tel'
    variant?: 'outlined' | 'underlined'
    density?: 'compact' | 'comfortable' | 'default'
    hint?: string
    /** 失焦後才觸發驗證，避免使用者還在打字就跳紅字 */
    triggerBlurRule?: boolean
    // FieldWrap Options:
    inlineLabel?: boolean
    invisibleLabel?: boolean
    column?: string
  }>(),
  {
    id: undefined,
    label: undefined,
    placeholder: undefined,
    errorMessages: undefined,
    hideDetails: true,
    clearable: false,
    prependInnerIcon: undefined,
    maxlength: undefined,
    type: 'text',
    variant: 'outlined',
    density: 'compact',
    hint: undefined,
    triggerBlurRule: true,
    // FieldWrap Options:
    inlineLabel: undefined,
    invisibleLabel: undefined,
    column: undefined,
  }
)

const model = defineModel<number | string | null>()
const innerId = ref(props.id ?? useId())
const hintId = `${innerId.value}-hint`
const touched = ref(false)

const placeholderText = computed(() => props.placeholder ?? (props.label ? `輸入${props.label}` : '輸入'))
const rules = computed(() => {
  if (props.triggerBlurRule && !touched.value) return []
  return [
    ...isRequired(props.required),
    ...isEmail(props.type === 'email'),
    ...isUrl(props.type === 'url'),
    ...(props.maxlength ? maxLength(props.maxlength) : []),
  ]
})
const computedHideDetails = computed(() => !props.errorMessages && props.hideDetails)

const onBlur = () => {
  touched.value = true
  emit('blur', model.value)
}
</script>

<template>
  <FieldWrap :label="label" :inline-label="inlineLabel" :column="column">
    <template #label>
      <BaseLabel
        v-if="label"
        :for="innerId"
        :label="label"
        :required="required"
        :invisible-label="invisibleLabel"
      />
    </template>
    <div class="base-input-wrap">
      <VTextField
        :id="innerId"
        v-model.trim="model"
        :type="type"
        :placeholder="placeholderText"
        :disabled="disabled"
        :rules="rules"
        :error-messages="errorMessages ?? undefined"
        :prepend-inner-icon="prependInnerIcon"
        :clearable="clearable"
        :maxlength="maxlength"
        :hide-details="computedHideDetails"
        :variant="variant"
        :density="density"
        color="primary"
        :aria-invalid="!!errorMessages"
        :aria-describedby="hint ? hintId : undefined"
        @blur="onBlur"
        @focus="emit('focus', model)"
      >
        <template v-if="$slots.append" #append>
          <slot name="append" />
        </template>
        <template v-if="$slots['append-inner']" #append-inner>
          <slot name="append-inner" />
        </template>
      </VTextField>
      <p v-if="hint" :id="hintId" class="hint-text">{{ hint }}</p>
    </div>
  </FieldWrap>
</template>

<style lang="scss" scoped>
.base-input-wrap {
  position: relative;
  width: 100%;
}
.hint-text {
  @include body2-regular;
  margin-top: 2px;
  color: var(--placeholder);
}
</style>
