<script lang="ts" setup>
import { ref, useId } from 'vue'
import BaseLabel from '@/components/common/form/BaseLabel.vue'
import type { OptionBase, SelectValue } from '@/types/common/form/OptionBase'

const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    items: OptionBase<SelectValue>[]
    required?: boolean
    disabled?: boolean
    inline?: boolean
    errorMessages?: string | null
  }>(),
  {
    id: undefined,
    label: undefined,
    errorMessages: undefined,
  }
)

const model = defineModel<SelectValue | null>()
const innerId = ref(props.id ?? useId())
</script>

<template>
  <VRadioGroup
    :id="innerId"
    v-model="model"
    :inline="inline"
    :disabled="disabled"
    :error-messages="errorMessages ?? undefined"
    :hide-details="!errorMessages"
    color="primary"
    density="compact"
    class="base-radio-group"
  >
    <template v-if="label" #label>
      <BaseLabel tag="p" :label="label" :required="required" />
    </template>
    <VRadio v-for="item in items" :key="String(item.value)" :label="item.text" :value="item.value" />
  </VRadioGroup>
</template>

<style lang="scss" scoped>
.base-radio-group :deep(.v-label) {
  @include body1-regular;
  opacity: 1;
  color: var(--font);
}
</style>
