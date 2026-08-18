<script lang="ts" setup>
import BaseCheckbox from '@/components/common/checkbox/BaseCheckbox.vue'
import BaseButton from '@/components/common/button/BaseButton.vue'
import { useThemeMode } from '@/composables/common/useThemeMode'

// 頁面頂部的說明與開關
const showOutline = defineModel<boolean>({ default: false })
const { mode, toggle } = useThemeMode()
</script>

<template>
  <section class="example-notes">
    <h1>Veekend 元件庫</h1>
    <p class="example-notes__lead">
      共用元件都在 <code>app/components/common/</code>，一律顯式 import。
      設計沿用 legacy-app，寫法對齊 2025_NPS_NatureDB/002_View。
    </p>

    <ol class="example-notes__list">
      <li>元件命名一律 <code>Base*</code>；外觀變體用 <code>styling</code> prop，不要另外開新元件。</li>
      <li>樣式吃 CSS 變數（<code>var(--primary)</code>）與 typography mixin（<code>@include body1-regular</code>），不要寫死色碼。</li>
      <li>SCSS partial 若要用變數或 mixin，開頭要自己寫 <code>@use 'preprocess' as *;</code>。</li>
      <li>提示與對話框透過 <code>useAlert()</code> / <code>useDialog()</code> 呼叫，不要自己掛元件。</li>
      <li>碰 <code>window</code> 的元件（例如 BaseMap）必須包 <code>&lt;ClientOnly&gt;</code>，否則 <code>nuxt generate</code> 會失敗。</li>
    </ol>

    <div class="example-notes__controls">
      <BaseCheckbox v-model="showOutline" label="顯示所有元素的外框" />
      <BaseButton
        :text="mode === 'dark' ? '切換為淺色' : '切換為深色'"
        styling="secondary"
        size="small"
        prepend-icon="mdi:theme-light-dark"
        @click="toggle"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.example-notes {
  padding: 24px 0;

  h1 {
    @include display;
    font-size: 2.5rem;
    color: var(--title);
  }

  &__lead {
    @include body1-regular;
    margin: 8px 0 16px;
    color: var(--subtitle);
  }

  &__list {
    @include body2-regular;
    list-style: decimal inside;
    color: var(--font);

    li {
      margin-bottom: 6px;
    }
  }

  &__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
  }

  code {
    padding: 1px 4px;
    color: var(--font);
    background-color: var(--container);
    border-radius: var(--border-radius-s);
  }
}
</style>
