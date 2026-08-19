<script lang="ts" setup>
import BaseDialog from '@/components/common/dialog/BaseDialog.vue'

/**
 * 版型速查。用色塊示意每種排版長什麼樣，避免填表時要靠想像。
 *
 * 示意圖刻意用純 CSS 畫，不放真圖——目的是看懂「元素怎麼排」，
 * 不是看內容。灰塊＝圖片、黃條＝標題、淺灰線＝文字。
 *
 * ⚠ 不要加 <template #footer>：BaseDialog 的 footer 是 <slot name="footer">預設按鈕</slot>，
 *   傳一個渲染不出東西的 slot 會讓 Vue 回退到預設內容，反而把「取消／確定」叫出來。
 *   要沒有按鈕就完全不傳這個 slot，配合 :default-buttons="false"。
 */
const open = defineModel<boolean>({ default: false })

interface LayoutGuide {
  /** 存進 Sheets 的值 */
  value: string
  name: string
  /** 資料裡出現幾次，讓人知道哪些是主力版型 */
  usage: number
  description: string
  /** 建議的 parts 順序 */
  order: string
  /** 示意圖的排法 */
  shape: 'imageLeft' | 'imageRight' | 'stackImageTop' | 'stackTextTop' | 'video' | 'gallery'
}

const layouts: LayoutGuide[] = [
  {
    value: 'imageLeft',
    name: '圖左文右',
    usage: 12,
    description: '景點介紹的主力版型。圖片與文字各佔一半，圖片最高 300px。',
    order: '圖片 → 景點名稱(h4) → 評分(h6) → 條列',
    shape: 'imageLeft',
  },
  {
    value: 'imageRight',
    name: '文左圖右',
    usage: 11,
    description: '與圖左文右相同，只是左右對調。連續多個景點時交錯使用，版面比較有節奏。',
    order: '景點名稱(h4) → 評分(h6) → 條列 → 圖片',
    shape: 'imageRight',
  },
  {
    value: 'textFirst',
    name: '文字在上、圖在下',
    usage: 10,
    description: '先講故事再放照片。手機版會自動把圖片移到文字上方。',
    order: '小標題(h5) → 條列 → 圖片',
    shape: 'stackTextTop',
  },
  {
    value: 'imageFirst',
    name: '圖在上、文字在下',
    usage: 9,
    description: '照片先聲奪人，再補說明。滿版圖片，不裁切。',
    order: '圖片 → 小標題(h5) → 條列',
    shape: 'stackImageTop',
  },
  {
    value: 'video',
    name: '影片區塊',
    usage: 7,
    description: '嵌入 YouTube。影片高度固定 350px。',
    order: '小標題(h5) → 影片 → 段落',
    shape: 'video',
  },
]

const gallery = {
  name: '三欄圖文',
  usage: 7,
  description: '三個並排的小卡，各有圖片、標題與說明。手機版會自動變成一欄。',
  order: '每一欄：圖片 + 小標題 + 說明',
}
</script>

<template>
  <BaseDialog
    v-model="open"
    title="內文版型速查"
    max-width="760px"
    :default-buttons="false"
    class="layout-guide"
  >
    <p class="layout-guide__intro">
      灰塊是圖片、黃條是標題、淺灰線是文字。括號裡的數字是目前 12 篇文章實際用到的次數。
    </p>

    <div class="layout-guide__list">
      <section v-for="layout in layouts" :key="layout.value" class="guide">
        <div class="guide__preview" :class="`is-${layout.shape}`">
          <!-- 圖左文右 / 文左圖右 -->
          <template v-if="layout.shape === 'imageLeft' || layout.shape === 'imageRight'">
            <div class="ph ph--image" />
            <div class="ph__text">
              <span class="ph ph--title" />
              <span class="ph ph--line" />
              <span class="ph ph--line" />
              <span class="ph ph--line is-short" />
            </div>
          </template>

          <!-- 圖在上 -->
          <template v-else-if="layout.shape === 'stackImageTop'">
            <div class="ph ph--image is-wide" />
            <span class="ph ph--title" />
            <span class="ph ph--line" />
            <span class="ph ph--line is-short" />
          </template>

          <!-- 文字在上 -->
          <template v-else-if="layout.shape === 'stackTextTop'">
            <span class="ph ph--title" />
            <span class="ph ph--line" />
            <span class="ph ph--line is-short" />
            <div class="ph ph--image is-wide" />
          </template>

          <!-- 影片 -->
          <template v-else-if="layout.shape === 'video'">
            <span class="ph ph--title" />
            <div class="ph ph--video is-wide">
              <Icon name="mdi:play-circle-outline" aria-hidden="true" />
            </div>
            <span class="ph ph--line" />
          </template>
        </div>

        <div class="guide__info">
          <h3>
            {{ layout.name }}
            <code>{{ layout.value }}</code>
            <span class="guide__usage">用了 {{ layout.usage }} 次</span>
          </h3>
          <p>{{ layout.description }}</p>
          <p class="guide__order">建議順序：{{ layout.order }}</p>
        </div>
      </section>

      <!-- 三欄圖文是另一種區塊型別，不是 section 的版面 -->
      <section class="guide">
        <div class="guide__preview is-gallery">
          <div v-for="n in 3" :key="n" class="ph__column">
            <div class="ph ph--image" />
            <span class="ph ph--title" />
            <span class="ph ph--line" />
          </div>
        </div>

        <div class="guide__info">
          <h3>
            {{ gallery.name }}
            <code>區塊型別選「三欄圖文」</code>
            <span class="guide__usage">用了 {{ gallery.usage }} 次</span>
          </h3>
          <p>{{ gallery.description }}</p>
          <p class="guide__order">{{ gallery.order }}</p>
        </div>
      </section>
    </div>

    <div class="layout-guide__note">
      <h4>兩件容易搞混的事</h4>
      <ol>
        <li>
          <strong>「圖在上」與「文字在上」在電腦版看起來一樣</strong>——實際順序由你把圖片放在元素清單的第幾個決定。
          版面選項只影響手機版（「文字在上」會把圖片移到上面）。
        </li>
        <li>
          <strong>文章開頭的目錄不用自己建</strong>——只要在區塊填了「錨點 ID」，目錄就會自動列出該區塊的「景點名稱」標題。
        </li>
      </ol>
    </div>
  </BaseDialog>
</template>

<style lang="scss" scoped>
.layout-guide {
  &__intro {
    @include body2-regular;
    margin-bottom: 16px;
    color: var(--subtitle);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__note {
    padding: 12px;
    margin-top: 24px;
    background-color: var(--primary-container);
    border-left: 4px solid var(--primary);
    border-radius: var(--border-radius-s);

    h4 {
      @include body2-bold;
      margin-bottom: 6px;
      color: var(--title);
    }

    ol {
      @include body2-regular;
      padding-left: 18px;
      list-style: decimal;
      color: var(--font);
    }

    li {
      margin-bottom: 6px;
    }
  }
}

.guide {
  display: flex;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--divider);

  @include mobile {
    flex-direction: column;
  }

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  &__preview {
    display: flex;
    flex: 0 0 200px;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    background-color: var(--white);
    border: 1px solid var(--divider);
    border-radius: var(--border-radius-s);

    @include mobile {
      flex: none;
      width: 100%;
      max-width: 260px;
    }
  }

  &__info {
    flex: 1 1 auto;

    h3 {
      @include body1-bold;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      margin-bottom: 4px;
      color: var(--title);
    }

    code {
      @include body2-regular;
      padding: 1px 6px;
      color: var(--subtitle);
      background-color: var(--container);
      border-radius: var(--border-radius-s);
    }

    p {
      @include body2-regular;
      color: var(--font);
    }
  }

  &__usage {
    @include body2-regular;
    color: var(--placeholder);
  }

  &__order {
    margin-top: 4px;
    color: var(--subtitle) !important;
  }
}

// ── 示意圖的積木 ──────────────────────────────────
.ph {
  display: block;
  border-radius: 2px;

  &--image {
    height: 56px;
    background-color: var(--stroke);
  }

  &--video {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 56px;
    font-size: 1.5rem;
    color: var(--white);
    background-color: var(--secondary);
  }

  &--title {
    height: 8px;
    background-color: var(--primary);
  }

  &--line {
    height: 5px;
    background-color: var(--divider);
  }

  &--line.is-short {
    width: 60%;
  }

  &.is-wide {
    width: 100%;
  }

  &__text {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 4px;
  }

  &__column {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    gap: 4px;

    .ph--image {
      height: 36px;
    }
  }
}

// 圖文各半的兩種：用 flex 方向表達左右
.guide__preview.is-imageLeft,
.guide__preview.is-imageRight {
  flex-direction: row;
  align-items: flex-start;

  .ph--image {
    flex: 0 0 45%;
    height: 72px;
  }
}

.guide__preview.is-imageRight {
  flex-direction: row-reverse;
}

.guide__preview.is-gallery {
  flex-direction: row;
  gap: 6px;
}
</style>
