<script lang="ts" setup>
import { ref, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    id?: string
    label: string
    disabled?: boolean
    hideDetails?: boolean
    errorMessages?: string | null
  }>(),
  {
    id: undefined,
    hideDetails: true,
    errorMessages: undefined,
  }
)

const model = defineModel<boolean>({ default: false })
const innerId = ref(props.id ?? useId())
</script>

<template>
  <VCheckbox
    :id="innerId"
    v-model="model"
    :label="label"
    :disabled="disabled"
    :error-messages="errorMessages ?? undefined"
    :hide-details="!errorMessages && hideDetails"
    color="primary"
    density="compact"
    class="base-checkbox"
  />
</template>

<style lang="scss" scoped>
.base-checkbox :deep(.v-label) {
  @include body1-regular;
  opacity: 1;
  color: var(--font);
}
</style>
