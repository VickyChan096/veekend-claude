<script lang="ts" setup>
import BaseImage from '@/components/common/image/BaseImage.vue'
// 文章卡片。設計來自 legacy 的 .articleList：圖片預設灰階，hover 才放大並回復彩色。
withDefaults(
  defineProps<{
    to?: string
    title: string
    /** 摘要，超出兩行截斷 */
    briefing?: string
    imageUrl?: string
    imageAlt?: string
    /** 圖片左上角的標籤，例如「WEEK 01」 */
    badge?: string
    /** 標題下方的一行 meta，例如「台北市 中山區」 */
    meta?: string
    /** 圖片右下角的小字，例如造訪日期 */
    note?: string
  }>(),
  {
    to: undefined,
    briefing: undefined,
    imageUrl: undefined,
    imageAlt: undefined,
    badge: undefined,
    meta: undefined,
    note: undefined,
  }
)
</script>

<template>
  <article class="base-card">
    <NuxtLink v-if="to" :to="to" class="base-card__link">
      <div v-if="imageUrl" class="base-card__photo">
        <span v-if="badge" class="base-card__badge">{{ badge }}</span>
        <BaseImage :src="imageUrl" :alt="imageAlt ?? title" sizes="sm:100vw md:480px" />
      </div>
      <div class="base-card__content">
        <p v-if="meta" class="base-card__meta">{{ meta }}</p>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <h3 class="base-card__title" v-html="title" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-if="briefing" class="base-card__briefing" v-html="briefing" />
        <p v-if="note" class="base-card__note">{{ note }}</p>
      </div>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
.base-card {
  padding: 20px 0;
  border-bottom: 1px solid var(--divider);

  &__link {
    display: flex;
    gap: 10px;

    @include min-mobile {
      gap: 8px;
    }
  }

  &__photo {
    position: relative;
    flex: 0 0 40%;
    height: 200px;
    overflow: hidden;
    border-radius: var(--border-radius-s);

    @include min-mobile {
      height: 150px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      // legacy 的識別設計：預設灰階，hover 才放大並回復彩色
      filter: grayscale(100%);
      transition: var(--transition-slow);
    }
  }

  &__badge {
    position: absolute;
    top: 12px;
    left: 0;
    z-index: 1;
    width: 80px;
    padding: 4px;
    color: var(--secondary);
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
    background-color: var(--primary);

    @include min-mobile {
      top: 0;
      width: 100%;
      color: var(--white);
      background-color: var(--secondary);
    }
  }

  &__content {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__meta {
    @include body2-regular;
    color: var(--subtitle);
  }

  &__title {
    @include head2-medium;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    color: var(--title);

    @include min-mobile {
      @include body1-medium;
    }
  }

  &__briefing {
    @include body2-regular;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    color: var(--subtitle);
  }

  &__note {
    @include body2-regular;
    margin-top: auto;
    color: var(--placeholder);
  }

  @include hover {
    &:hover .base-card__photo img {
      filter: grayscale(0%);
      transform: scale(1.2);
    }
  }
}
</style>
