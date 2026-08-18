<script lang="ts" setup>
// 一列展示區：左邊放標籤，右邊放元件
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="example-row">
    <p v-if="label" class="example-row__label">{{ label }}</p>
    <div class="example-row__items">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.example-row {
  margin-bottom: 20px;

  &__label {
    @include body2-medium;
    margin-bottom: 8px;
    color: var(--subtitle);
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }
}
</style>
