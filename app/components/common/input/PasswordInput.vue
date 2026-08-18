<script lang="ts" setup>
import { computed, ref } from 'vue'
import BaseInput from '@/components/common/input/BaseInput.vue'
import BaseIconButton from '@/components/common/button/BaseIconButton.vue'

withDefaults(
  defineProps<{
    id?: string
    label?: string
    placeholder?: string
    required?: boolean
    errorMessages?: string | null
    disabled?: boolean
    hint?: string
  }>(),
  {
    id: undefined,
    label: '密碼',
    placeholder: undefined,
    errorMessages: undefined,
    hint: undefined,
  }
)

const model = defineModel<string | null>()
const visible = ref(false)
const inputValue = computed({
  get: () => model.value ?? null,
  set: (value) => {
    model.value = value === null ? null : String(value)
  },
})
</script>

<template>
  <BaseInput
    :id="id"
    v-model="inputValue"
    :label="label"
    :placeholder="placeholder"
    :required="required"
    :error-messages="errorMessages"
    :disabled="disabled"
    :hint="hint"
    :type="visible ? 'text' : 'password'"
  >
    <template #append-inner>
      <BaseIconButton
        :icon="visible ? 'mdi:eye-off-outline' : 'mdi:eye-outline'"
        :label="visible ? '隱藏密碼' : '顯示密碼'"
        size="small"
        @click="visible = !visible"
      />
    </template>
  </BaseInput>
</template>
