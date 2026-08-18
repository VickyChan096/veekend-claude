<script lang="ts" setup>
import { ref } from 'vue'
import { useHead } from 'nuxt/app'
import ExampleNotes from '@/components/pages/example/ExampleNotes.vue'
import ExampleFonts from '@/components/pages/example/ExampleFonts.vue'
import ExampleColors from '@/components/pages/example/ExampleColors.vue'
import ExampleButtons from '@/components/pages/example/ExampleButtons.vue'
import ExampleForm from '@/components/pages/example/ExampleForm.vue'
import ExampleDisplay from '@/components/pages/example/ExampleDisplay.vue'
import ExampleNavigation from '@/components/pages/example/ExampleNavigation.vue'
import ExampleMedia from '@/components/pages/example/ExampleMedia.vue'
import ExampleFeedback from '@/components/pages/example/ExampleFeedback.vue'

// 元件庫展示頁。新增共用元件時記得在這裡補一個展示區塊。
useHead({ title: '元件庫 | Veekend' })

const showOutline = ref(false)
const controller = ref({
  font: false,
  color: false,
  button: true,
  form: false,
  display: true,
  navigation: false,
  media: false,
  feedback: false,
})
</script>

<template>
  <div class="example-wrap" :class="{ 'show-outline': showOutline }">
    <ExampleNotes v-model="showOutline" />
    <ExampleFonts v-model="controller.font" />
    <ExampleColors v-model="controller.color" />
    <ExampleButtons v-model="controller.button" />
    <ExampleForm v-model="controller.form" />
    <ExampleDisplay v-model="controller.display" />
    <ExampleNavigation v-model="controller.navigation" />
    <ExampleMedia v-model="controller.media" />
    <ExampleFeedback v-model="controller.feedback" />
  </div>
</template>

<style lang="scss">
.show-outline *,
.show-outline *::before,
.show-outline *::after {
  outline: 1px solid #d3d3d3;
}

.example-wrap {
  width: 100%;
  max-width: calc(1200px + 40px);
  margin: 0 auto;
  padding: 0 20px 80px;
  color: var(--font);
  background-color: var(--surface);
}
</style>
