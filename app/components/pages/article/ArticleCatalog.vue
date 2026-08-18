<script lang="ts" setup>
import { ref } from 'vue'
import type { CatalogItem } from '@/types/api/articleContent'

// legacy 的 .article__middle__catalog：可摺疊的本週景點目錄
defineProps<{
  label: string
  items: CatalogItem[]
}>()

const open = ref(true)
</script>

<template>
  <nav class="catalog" aria-label="本週景點目錄">
    <p class="catalog__label">{{ label }}</p>
    <button
      type="button"
      class="catalog__toggle"
      :class="{ 'is-open': open }"
      :aria-expanded="open"
      :aria-label="open ? '收合景點目錄' : '展開景點目錄'"
      @click="open = !open"
    >
      <Icon name="mdi:close-circle" />
    </button>
    <ul v-show="open" class="catalog__list">
      <li v-for="item in items" :key="item.anchor">
        <a :href="`#${item.anchor}`">{{ item.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.catalog {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 300px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: left;
  border: 1px solid var(--divider);
  border-radius: var(--border-radius-s);

  @include min-mobile {
    width: 100%;
  }

  &__label {
    @include head2-bold;
  }

  &__toggle {
    font-size: 1.5rem;
    color: var(--divider);
    background: none;
    border: 0;
    transition: var(--transition-slow);

    &.is-open {
      color: var(--secondary);
      rotate: 225deg;
    }

    &:focus-visible {
      outline: var(--focus-visible);
    }
  }

  &__list {
    width: 100%;
    line-height: 2;

    a {
      display: block;
      padding: 0 4px;
      overflow: hidden;
      color: var(--secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: var(--transition-fast);

      &::before {
        content: '• ';
      }

      @include hover {
        &:hover {
          background-color: var(--divider);
          border-radius: var(--border-radius-s);
        }
      }
    }
  }
}
</style>
