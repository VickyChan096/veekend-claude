<script lang="ts" setup>
import type { BreadcrumbsItem } from '@/types/common/breadcrumbs/BreadcrumbsItem'

defineProps<{
  items: BreadcrumbsItem[]
}>()
</script>

<template>
  <nav class="bread-crumbs" aria-label="麵包屑">
    <ol>
      <li v-for="(item, itemIndex) in items" :key="item.title">
        <NuxtLink v-if="item.to && !item.disabled" :to="item.to">{{ item.title }}</NuxtLink>
        <span v-else aria-current="page">{{ item.title }}</span>
        <Icon v-if="itemIndex < items.length - 1" name="mdi:chevron-right" aria-hidden="true" />
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped>
.bread-crumbs {
  ol {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }
  li {
    @include body2-regular;
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--subtitle);
  }
  a {
    color: var(--subtitle);

    @include hover {
      &:hover {
        color: var(--font);
        text-decoration: underline;
      }
    }
  }
  .bread-crumbs span {
    color: var(--font);
    font-weight: 500;
  }
}
</style>
