<script lang="ts" setup>
import { computed } from 'vue'
import { useHead, clearError } from 'nuxt/app'
import type { NuxtError } from 'nuxt/app'
import BaseButton from '@/components/common/button/BaseButton.vue'

/**
 * Nuxt 的預設錯誤頁長得完全不像這個站，靜態站又只會產出 404.html，
 * 所以自己接一個。error.vue 不吃 layout，header／footer 要自己判斷要不要放——
 * 這裡刻意不放，讓錯誤頁單純一點。
 */
const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error?.statusCode === 404)

const title = computed(() => (isNotFound.value ? '找不到這一頁' : '出了點狀況'))
const message = computed(() =>
  isNotFound.value
    ? '這條路好像走錯了。也許是網址打錯，或是這篇文章已經不在這裡。'
    : '伺服器在準備這一頁的時候絆了一下，稍後再試試看。'
)

useHead({
  title: computed(() => `${props.error?.statusCode ?? 500} ${title.value} | Veekend`),
  meta: [{ name: 'robots', content: 'noindex' }],
})

// clearError 帶 redirect 會清掉錯誤狀態再導頁，直接用 NuxtLink 在靜態站上會留著錯誤畫面
const goHome = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="error-page">
    <div class="error-page__inner">
      <p class="error-page__code">{{ error?.statusCode ?? 500 }}</p>
      <h1 class="error-page__title">{{ title }}</h1>
      <p class="error-page__message">{{ message }}</p>

      <div class="error-page__actions">
        <BaseButton text="回首頁" @click="goHome" />
        <BaseButton text="搜尋文章" styling="secondary" @click="clearError({ redirect: '/result' })" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
  background-color: var(--surface);

  &__inner {
    max-width: 480px;
    text-align: center;
  }

  // 大數字用主色的粗底線收尾，跟文章頁的評分是同一個語彙
  &__code {
    font-size: 6rem;
    font-weight: 700;
    line-height: 1;
    color: var(--title);
    text-decoration: underline;
    text-decoration-color: var(--primary);
    text-decoration-thickness: 16px;
    text-decoration-skip-ink: none;
    text-underline-offset: -8px;
  }

  &__title {
    @include head1-bold;
    margin-top: 24px;
    color: var(--title);
  }

  &__message {
    @include body1-regular;
    margin-top: 12px;
    color: var(--subtitle);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-top: 32px;
  }
}
</style>
