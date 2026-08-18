<script lang="ts" setup>
import ExampleSection from '@/components/pages/example/ExampleSection.vue'

const open = defineModel<boolean>({ default: false })

// 對應 preprocess.scss 的 $theme-light / $theme-dark
const tokens = [
  'primary',
  'primary-darken',
  'primary-lighten',
  'primary-container',
  'secondary',
  'secondary-lighten',
  'title',
  'subtitle',
  'font',
  'placeholder',
  'white',
  'surface',
  'container',
  'divider',
  'stroke',
  'disabled',
  'frame',
  'red1',
  'red1-container',
  'green1',
  'green1-container',
  'blue1',
  'blue1-container',
]
</script>

<template>
  <ExampleSection v-model="open" title="色彩" note="切換深色模式時整組會跟著換值">
    <ul class="color-grid">
      <li v-for="token in tokens" :key="token">
        <span class="color-grid__swatch" :style="{ backgroundColor: `var(--${token})` }" />
        <code>--{{ token }}</code>
      </li>
    </ul>
  </ExampleSection>
</template>

<style lang="scss" scoped>
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__swatch {
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border: 1px solid var(--divider);
    border-radius: var(--border-radius-s);
  }

  code {
    @include body2-regular;
    color: var(--subtitle);
  }
}
</style>
