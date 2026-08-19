<script lang="ts" setup>
import BaseInput from '@/components/common/input/BaseInput.vue'
import BaseImage from '@/components/common/image/BaseImage.vue'
import type { ImageDto } from '@/types/api/dto/article.dto'

// 圖片欄位在好幾個地方重複出現（內文圖、圖片＋說明、三欄圖文），抽出來共用
const image = defineModel<ImageDto>({ required: true })
</script>

<template>
  <div class="image-fields">
    <BaseInput
      v-model="image.src"
      label="圖片路徑"
      required
      :hide-details="false"
      hint="相對於 public/，例如 images/week1/photo-01.jpg"
    />
    <BaseInput
      v-model="image.alt"
      label="替代文字"
      :hide-details="false"
      hint="給讀不到圖片的人與搜尋引擎看的描述"
    />
    <BaseInput
      v-model="image.fullSrc"
      label="燈箱大圖路徑"
      :hide-details="false"
      hint="留空就用上面的圖片路徑"
    />
    <BaseInput v-model="image.caption" label="圖片說明" :hide-details="false" />

    <div v-if="image.src" class="image-fields__preview">
      <p>預覽</p>
      <BaseImage :src="image.src" :alt="image.alt ?? ''" sizes="sm:100vw md:384px" ratio="3/2" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__preview {
    max-width: 320px;

    p {
      @include body2-medium;
      margin-bottom: 4px;
      color: var(--subtitle);
    }
  }
}
</style>
