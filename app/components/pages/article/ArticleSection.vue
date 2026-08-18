<script lang="ts" setup>
import { useAssetUrl } from '@/composables/common/useAssetUrl'
import type { ArticlePart, SectionLayout } from '@/types/api/articleContent'

/**
 * 內文的一個區塊。對應 legacy 的 section.articleStyle1~4、6。
 * parts 維持解析時的原始順序，版面由 layout 決定：
 * - imageLeft／imageRight：圖文各半
 * - imageFirst／textFirst：全寬圖 + 文字
 * - video：影片區塊
 */
defineProps<{
  layout: SectionLayout
  anchorId?: string
  parts: ArticlePart[]
}>()

const emit = defineEmits<{ (e: 'open-image', fullSrc: string): void }>()
const assetUrl = useAssetUrl()
</script>

<template>
  <section :id="anchorId" class="article-section" :class="`is-${layout}`">
    <template v-for="(part, partIndex) in parts" :key="partIndex">
      <h3 v-if="part.kind === 'heading' && part.level === 4" class="article-section__place">
        {{ part.text }}
      </h3>
      <h3 v-else-if="part.kind === 'heading' && part.level === 5" class="article-section__heading">
        {{ part.text }}
      </h3>
      <p v-else-if="part.kind === 'heading' && part.level === 6" class="article-section__rate">
        {{ part.text }}
      </p>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <ul v-else-if="part.kind === 'list'" class="article-section__list">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <li v-for="(item, itemIndex) in part.items" :key="itemIndex" v-html="item" />
      </ul>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-else-if="part.kind === 'paragraph'" class="article-section__text" v-html="part.html" />

      <button
        v-else-if="part.kind === 'image'"
        type="button"
        class="article-section__image"
        :aria-label="part.image.alt ? `放大檢視：${part.image.alt}` : '放大檢視圖片'"
        @click="emit('open-image', part.image.fullSrc)"
      >
        <img :src="assetUrl(part.image.src)" :alt="part.image.alt ?? ''" loading="lazy" >
        <span class="article-section__zoom">點擊看大圖</span>
      </button>

      <div v-else-if="part.kind === 'imageText'" class="article-section__image-text">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="part.html" />
        <button
          type="button"
          :aria-label="part.image.alt ? `放大檢視：${part.image.alt}` : '放大檢視圖片'"
          @click="emit('open-image', part.image.fullSrc)"
        >
          <img :src="assetUrl(part.image.src)" :alt="part.image.alt ?? ''" loading="lazy" >
        </button>
      </div>

      <div v-else-if="part.kind === 'video'" class="article-section__video">
        <iframe
          :src="part.src"
          title="影片"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        />
      </div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.article-section {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--divider);

  // 景點名稱，前面掛一個會上下跳動的定位圖示
  &__place {
    @include head2-bold;
    position: relative;
    margin-bottom: 10px;
    text-indent: 1.5rem;

    &::before {
      content: '';
      position: absolute;
      top: 7px;
      left: 0;
      width: 20px;
      height: 20px;
      background-image: url('/images/location.svg');
      animation: location-bounce 2s infinite ease-out;
    }
  }

  &__heading {
    @include body1-bold;
    margin-bottom: 10px;
  }

  // 個人評分：黃色粗底線，右邊掛一個 [註] 小標
  &__rate {
    position: relative;
    display: inline-block;
    margin-bottom: 10px;
    text-decoration: underline;
    text-decoration-color: var(--primary);
    text-decoration-thickness: 8px;
    text-decoration-skip-ink: none;
    text-underline-offset: -4px;

    &::before {
      content: '[註]';
      position: absolute;
      right: -25px;
      font-size: 0.6rem;
      color: var(--subtitle);
    }

    @include hover {
      &:hover::after {
        content: '滿分5分';
        position: absolute;
        top: 18px;
        right: -45px;
        width: 60px;
        padding: 4px;
        font-size: 0.6rem;
        color: #ffffff;
        text-align: center;
        background: rgb(0 0 0 / 60%);
        border-radius: var(--border-radius-s);
      }
    }
  }

  &__list li {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__text {
    margin-bottom: 8px;
  }

  &__image {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    background: none;
    border: 0;

    img {
      width: 100%;
      border-radius: var(--border-radius-s);
    }

    &:focus-visible {
      outline: var(--focus-visible);
    }
  }

  // legacy 只有 fancybox 圖片有這條提示，現在每張都能點開，所以每張都給
  &__zoom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 4px;
    color: #ffffff;
    text-align: center;
    background-color: var(--secondary);
    border-radius: 0 0 var(--border-radius-s) var(--border-radius-s);
    opacity: 0;
    transition: var(--transition-fast);
  }

  @include hover {
    &__image:hover &__zoom {
      opacity: 1;
    }
  }

  &__image:focus-visible &__zoom {
    opacity: 1;
  }

  // 圖片上方疊一條半透明黑底說明
  &__image-text {
    position: relative;
    margin-bottom: 10px;

    > p {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      padding: 4px 12px;
      color: #ffffff;
      background-color: rgb(0 0 0 / 60%);
      border-radius: var(--border-radius-s) var(--border-radius-s) 0 0;
    }

    button {
      display: block;
      width: 100%;
      padding: 0;
      background: none;
      border: 0;
    }

    img {
      width: 100%;
      border-radius: var(--border-radius-s);
    }
  }

  &__video iframe {
    width: 100%;
    height: 350px;
    border: 0;
    border-radius: var(--border-radius-s);
  }

  // 內文行內連結
  :deep(a) {
    color: var(--secondary);
    text-decoration: underline;

    @include hover {
      &:hover {
        text-decoration: none;
      }
    }
  }

  :deep(.wikiHref) {
    font-size: 0.5rem;
    color: var(--subtitle);
  }

  :deep(mark) {
    background-color: var(--primary);
  }
}

// 圖左文右 / 文左圖右
.is-imageLeft,
.is-imageRight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  .article-section__image {
    width: 50%;
    max-height: 300px;

    img {
      max-height: 300px;
      object-fit: cover;
    }

    @include mobile {
      width: 100%;
      max-height: none;
      margin-bottom: 10px;

      img {
        max-height: none;
      }
    }
  }

  // 標題、評分、清單一起佔另外一半
  .article-section__place,
  .article-section__rate,
  .article-section__list,
  .article-section__heading,
  .article-section__text {
    width: 50%;
    padding-left: 20px;

    @include mobile {
      width: 100%;
      padding-left: 0;
    }
  }
}

.is-imageRight {
  flex-direction: row-reverse;

  .article-section__place,
  .article-section__rate,
  .article-section__list,
  .article-section__heading,
  .article-section__text {
    padding-right: 20px;
    padding-left: 0;
  }

  @include mobile {
    flex-direction: column-reverse;
  }
}

// 全寬圖 + 文字
.is-imageFirst,
.is-textFirst {
  .article-section__image {
    margin-bottom: 10px;
  }
}

.is-textFirst {
  @include mobile {
    display: flex;
    flex-direction: column-reverse;
    flex-wrap: wrap;
  }
}

@keyframes location-bounce {
  0% {
    top: 7px;
  }
  20% {
    top: -2px;
    opacity: 0;
  }
  40% {
    top: 7px;
    opacity: 1;
  }
  60% {
    top: 0;
  }
  100% {
    top: 7px;
  }
}
</style>
