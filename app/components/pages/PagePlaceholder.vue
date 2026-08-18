<script lang="ts" setup>
import BaseButton from '@/components/common/button/BaseButton.vue'

// 尚未重構的頁面佔位。存在的理由：nuxt generate 的 crawler 會跟著站內連結爬，
// 連到不存在的路由會讓建置失敗，所以先把路由佔起來。
defineProps<{
  title: string
  /** 這頁預計在哪個 phase 移植，以及對應的 legacy 檔案 */
  note: string
}>()
</script>

<template>
  <div class="placeholder">
    <h1>{{ title }}</h1>
    <p>{{ note }}</p>
    <BaseButton to="/" text="回首頁" prepend-icon="mdi:arrow-left" />
  </div>
</template>

<style lang="scss" scoped>
.placeholder {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 30px 120px;

  @include mobile {
    padding: 40px 15px 80px;
  }

  h1 {
    @include head1-bold;
    color: var(--title);
  }

  p {
    @include body1-regular;
    margin: 8px 0 24px;
    color: var(--subtitle);
  }
}
</style>
