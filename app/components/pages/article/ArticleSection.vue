<script lang="ts" setup>
import { computed } from 'vue'
import BaseImage from '@/components/common/image/BaseImage.vue'
import BaseRating from '@/components/common/rating/BaseRating.vue'
import type { ArticlePart, SectionLayout } from '@/types/api/articleContent'

/**
 * 內文的一個區塊。對應 legacy 的 section.articleStyle1~4、6。
 * parts 維持解析時的原始順序，版面由 layout 決定：
 * - imageLeft／imageRight：圖文各半
 * - imageFirst／textFirst：全寬圖 + 文字
 * - video：影片區塊
 */
const props = defineProps<{
  layout: SectionLayout
  anchorId?: string
  parts: ArticlePart[]
}>()

const emit = defineEmits<{ (e: 'open-image', fullSrc: string): void }>()

// 圖文各半的版面只佔一半寬度，請 ipx 產小一點的圖就好
const isHalfWidth = computed(() => props.layout === 'imageLeft' || props.layout === 'imageRight')
const imageSizes = computed(() =>
  isHalfWidth.value ? 'sm:100vw md:512px' : 'sm:100vw md:1024px'
)

/**
 * h6 在 legacy 一律是「個人評分：4.5」這種字串，滿分 5。
 * 解析得出來就畫星星，解析不出來就原字照印——資料是人手打的，
 * 不該因為某天有人寫成別的格式就讓整個區塊消失。
 */
const RATE_PATTERN = /評分\s*[:：]?\s*([\d.]+)/
const parseRate = (text: string): number | null => {
  const matched = text.match(RATE_PATTERN)
  if (!matched) return null
  const value = Number(matched[1])
  return Number.isFinite(value) && value >= 0 && value <= 5 ? value : null
}
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
        <template v-if="parseRate(part.text) !== null">
          <span class="article-section__rate-label">個人評分</span>
          <BaseRating :model-value="parseRate(part.text)!" show-value />
        </template>
        <template v-else>{{ part.text }}</template>
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
        <BaseImage
          :src="part.image.src"
          :alt="part.image.alt ?? ''"
          :sizes="imageSizes"
          :ratio="isHalfWidth ? '4/3' : '3/2'"
        />
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
          <BaseImage :src="part.image.src" :alt="part.image.alt ?? ''" :sizes="imageSizes" rounded />
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

  // 個人評分：黃色粗底線的標籤 + 星星，右邊掛一個 [註] 小標
  &__rate {
    position: relative;
    display: inline-flex;
    flex-wrap: wrap;
    gap: 2px 8px;
    align-items: center;
    margin-bottom: 10px;

    // legacy 把 [註] 絕對定位在框的右邊界，但這個框在圖文各半的版面佔滿 50%，
    // 結果 [註] 會飄到隔壁欄壓到文字。改成排在星星後面的一般 flex 子元素。
    &::before {
      content: '[註]';
      order: 1;
      font-size: 0.6rem;
      color: var(--subtitle);
    }

    @include hover {
      &:hover::after {
        content: '滿分5分';
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 1;
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

  // 底線只畫在文字上，星星不該被劃掉
  &__rate-label {
    text-decoration: underline;
    text-decoration-color: var(--primary);
    text-decoration-thickness: 8px;
    text-decoration-skip-ink: none;
    text-underline-offset: -4px;
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

    img {
      max-height: 300px;
      object-fit: cover;
    }

    @include mobile {
      width: 100%;
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

// 全寬圖 + 文字。
// ⚠ 這兩種在桌機版的排法**完全相同**——實際順序取決於 parts 的順序，
//   版面值只影響手機版。命名是給編輯的人看的意圖，不是 CSS 差異。
.is-imageFirst,
.is-textFirst {
  .article-section__image {
    margin-bottom: 10px;
  }
}

// 手機版把圖片移到文字上方，讓人先看到照片再讀說明
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
