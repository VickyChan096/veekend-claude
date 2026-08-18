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
    /** 選項橫向排列 */
    inline?: boolean
  }>(),
  {
    id: undefined,
    label: undefined,
  }
)

const model = defineModel<SelectValue[]>({ default: () => [] })
const innerId = ref(props.id ?? useId())
</script>

<template>
  <fieldset class="base-checkbox-group" :class="{ 'is-inline': inline }">
    <legend>
      <BaseLabel v-if="label" tag="p" :label="label" :required="required" />
    </legend>
    <VCheckbox
      v-for="item in items"
      :key="String(item.value)"
      v-model="model"
      :value="item.value"
      :label="item.text"
      :disabled="disabled"
      :name="innerId"
      color="primary"
      density="compact"
      hide-details
    />
  </fieldset>
</template>

<style lang="scss" scoped>
.base-checkbox-group {
  padding: 0;
  border: 0;

  &.is-inline {
    display: flex;
    flex-wrap: wrap;
    gap: 0 16px;

    legend {
      width: 100%;
    }
  }

  :deep(.v-label) {
    @include body1-regular;
    opacity: 1;
    color: var(--font);
  }
}
</style>
