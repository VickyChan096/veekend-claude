<script lang="ts" setup>
// Example page 的共用區塊外框。
// 002_View 是每個 Example* 各自重複寫一遍 fieldset，這裡收斂成一個元件。
defineProps<{
  title: string
  /** 補充說明，例如「對應 legacy 的 .btnPrimary」 */
  note?: string
}>()

const open = defineModel<boolean>({ default: false })
</script>

<template>
  <section class="example-section">
    <button type="button" class="example-section__head" :aria-expanded="open" @click="open = !open">
      <Icon :name="open ? 'mdi:chevron-down' : 'mdi:chevron-right'" aria-hidden="true" />
      <h2>{{ title }}</h2>
    </button>
    <p v-if="note" class="example-section__note">{{ note }}</p>
    <div v-show="open" class="example-section__body">
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.example-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--divider);

  &__head {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 0;
    color: var(--title);
    text-align: start;
    background: none;
    border: 0;

    h2 {
      @include subtitle1-bold;
    }

    &:focus-visible {
      outline: var(--focus-visible);
    }
  }

  &__note {
    @include body2-regular;
    margin-top: 4px;
    color: var(--subtitle);
  }

  &__body {
    padding-top: 16px;
  }
}
</style>
