<script lang="ts" setup>
// legacy 的 #searchResult：關鍵字大標 + 命中篇數
defineProps<{
  heading: string
  count: number
}>()
</script>

<template>
  <section class="result-heading">
    <h1>{{ heading }}</h1>
    <p>
      Search Results 共<span>{{ count }}</span
      >篇符合
    </p>
  </section>
</template>

<style lang="scss" scoped>
.result-heading {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--divider);

  h1 {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.4;
    // legacy 的黃色粗底線，比文章標題細一點
    text-decoration: underline;
    text-decoration-color: var(--primary);
    text-decoration-thickness: 10px;
    text-decoration-skip-ink: none;
    text-underline-offset: -4px;

    @include min-mobile {
      font-size: 28px;
    }
  }

  p {
    @include body1-regular;
    color: var(--placeholder);
  }

  span {
    @include subtitle1-regular;
    padding: 0 4px;
    color: var(--secondary);
  }
}
</style>
