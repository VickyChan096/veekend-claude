<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    for?: string | number
    label?: string
    required?: boolean
    /** 視覺上隱藏，但保留給螢幕閱讀器 */
    invisibleLabel?: boolean
    tag?: 'label' | 'p'
  }>(),
  {
    for: undefined,
    label: undefined,
    required: undefined,
    invisibleLabel: undefined,
    tag: 'label',
  }
)
</script>

<template>
  <component
    :is="props.tag"
    :id="props.tag === 'label' ? `${props.for?.toString()}-label` : undefined"
    :for="props.tag === 'label' ? props.for?.toString() : undefined"
    class="base-label"
    :class="{ 'sr-only': props.invisibleLabel }"
    >{{ label }}<span v-if="required" aria-label="欄位必填">*</span></component
  >
</template>

<style lang="scss" scoped>
.base-label {
  @include body2-medium;
  display: inline-block;
  margin-bottom: 4px;
  color: var(--subtitle);

  span {
    margin-left: 2px;
    color: var(--red1);
  }
}
</style>
