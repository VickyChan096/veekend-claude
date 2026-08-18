<script lang="ts" setup>
import { useHead } from 'nuxt/app'
import PagePlaceholder from '@/components/pages/PagePlaceholder.vue'

useHead({ title: '搜尋結果 | Veekend' })
</script>

<template>
  <PagePlaceholder title="搜尋結果" note="Phase 6 移植 legacy-app/result.html + js/result.js" />
</template>
