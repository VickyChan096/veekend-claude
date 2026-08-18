<script lang="ts" setup>
import { useHead } from 'nuxt/app'
import PagePlaceholder from '@/components/pages/PagePlaceholder.vue'

useHead({ title: '關於 | Veekend' })
</script>

<template>
  <PagePlaceholder title="關於" note="Phase 6 移植 legacy-app/about.html" />
</template>
