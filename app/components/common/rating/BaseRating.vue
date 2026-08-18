<script lang="ts" setup>
// 對應 db.json 的 destinations[].rate（Google 評分，例如 3.9）
withDefaults(
  defineProps<{
    modelValue: number
    /** 唯讀時只顯示，不能點 */
    readonly?: boolean
    size?: 'x-small' | 'small' | 'default' | 'large'
    /** 星星旁邊顯示數字 */
    showValue?: boolean
    ariaLabel?: string
  }>(),
  {
    readonly: true,
    size: 'small',
    ariaLabel: undefined,
  }
)
</script>

<template>
  <div class="base-rating">
    <VRating
      :model-value="modelValue"
      :readonly="readonly"
      :size="size"
      :aria-label="ariaLabel ?? `評分 ${modelValue} 分`"
      half-increments
      density="compact"
      color="primary"
      active-color="primary"
      full-icon="mdi:star"
      half-icon="mdi:star-half-full"
      empty-icon="mdi:star-outline"
    />
    <span v-if="showValue" class="base-rating__value">{{ modelValue.toFixed(1) }}</span>
  </div>
</template>

<style lang="scss" scoped>
.base-rating {
  display: flex;
  align-items: center;
  gap: 4px;

  &__value {
    @include body2-medium;
    color: var(--subtitle);
  }
}
</style>
