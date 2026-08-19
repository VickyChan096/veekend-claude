<script lang="ts" setup>
import { computed, ref } from 'vue'
import { navigateTo, useHead, useRoute } from 'nuxt/app'
import BaseInput from '@/components/common/input/BaseInput.vue'
import PasswordInput from '@/components/common/input/PasswordInput.vue'
import BaseCheckbox from '@/components/common/checkbox/BaseCheckbox.vue'
import BaseButton from '@/components/common/button/BaseButton.vue'
import { useAuth } from '@/composables/common/useAuth'
import { loginRequestSchema } from '@/types/api/dto/auth.dto'

const route = useRoute()
const { login, pending, isLoggedIn } = useAuth()

const account = ref<string | number | null>('')
const password = ref<string | null>('')
const remember = ref(false)
const errorMessage = ref('')

const redirectTo = computed(() => String(route.query.redirect ?? '/article/edit'))

const submit = async () => {
  errorMessage.value = ''

  // 送出前先用 DTO schema 驗一次，跟之後接真 API 是同一份規則
  const parsed = loginRequestSchema.safeParse({
    account: String(account.value ?? ''),
    password: password.value ?? '',
    remember: remember.value,
  })

  if (!parsed.success) {
    errorMessage.value = parsed.error.issues[0]?.message ?? '請確認輸入內容'
    return
  }

  const failure = await login(parsed.data)
  if (failure) {
    errorMessage.value = failure
    return
  }

  await navigateTo(redirectTo.value)
}

useHead({ title: '登入 | Veekend' })
</script>

<template>
  <div class="login">
    <div class="login__card">
      <h1>登入</h1>

      <p class="login__notice">
        <Icon name="mdi:alert-outline" aria-hidden="true" />
        <!-- 文字要包成單一 flex item，不然 <strong> 會被當成獨立的欄 -->
        <span>
          這是<strong>示範用的假登入</strong>。純靜態網站沒有可以放驗證邏輯的伺服器，
          帳密比對在瀏覽器裡進行，任何人打開開發者工具都能繞過。
        </span>
      </p>

      <p v-if="isLoggedIn" class="login__hint">你已經登入了，送出後會直接進入編輯頁。</p>

      <form class="login__form" @submit.prevent="submit">
        <BaseInput
          v-model="account"
          label="帳號"
          required
          :hide-details="false"
          autocomplete="off"
          hint="示範帳號：vc"
        />

        <PasswordInput v-model="password" required hint="示範密碼：veekend" />

        <BaseCheckbox v-model="remember" label="記住我" />

        <p v-if="errorMessage" class="login__error" role="alert">{{ errorMessage }}</p>

        <BaseButton text="登入" type="submit" :loading="pending" block />
      </form>

      <NuxtLink to="/" class="login__back">← 回首頁</NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px);
  padding: 60px 20px;
  background-color: var(--surface);

  &__card {
    width: 100%;
    max-width: 420px;
  }

  h1 {
    @include display;
    margin-bottom: 20px;
    font-size: 48px;
    color: var(--title);
  }

  &__notice {
    @include body2-regular;
    display: flex;
    gap: 6px;
    padding: 12px;
    margin-bottom: 20px;
    color: var(--font);
    background-color: var(--primary-container);
    border-left: 4px solid var(--primary);
    border-radius: var(--border-radius-s);
  }

  &__hint {
    @include body2-regular;
    margin-bottom: 12px;
    color: var(--subtitle);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__error {
    @include body2-regular;
    color: var(--red1);
  }

  &__back {
    @include body2-regular;
    display: inline-block;
    margin-top: 24px;
    color: var(--subtitle);

    @include hover {
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
