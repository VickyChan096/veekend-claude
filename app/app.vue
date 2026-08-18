<script lang="ts" setup>
import GlobalComponents from '@/components/common/GlobalComponents.vue'
</script>

<template>
  <GlobalComponents />
  <NuxtLoadingIndicator color="#ffe60f" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
