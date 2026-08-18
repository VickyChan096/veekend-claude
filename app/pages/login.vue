<script lang="ts" setup>
import { useHead } from 'nuxt/app'
import PagePlaceholder from '@/components/pages/PagePlaceholder.vue'

useHead({ title: '登入 | Veekend' })
</script>

<template>
  <PagePlaceholder title="登入" note="Phase 7 移植 legacy-app/login.html（權限模型待決，見 CLAUDE.md 資料層段落）" />
</template>
