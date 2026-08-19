<script lang="ts" setup>
import { computed } from 'vue'
import BaseInput from '@/components/common/input/BaseInput.vue'
import BaseTextarea from '@/components/common/textarea/BaseTextarea.vue'
import BaseSelect from '@/components/common/select/BaseSelect.vue'
import ImageFields from '@/components/pages/edit/ImageFields.vue'
import { PART_KIND_LABELS } from '@/types/api/dto/article.dto'
import type { PartDto, PartKind } from '@/types/api/dto/article.dto'
import type { OptionBase, SelectValue } from '@/types/common/form/OptionBase'

/**
 * 內文的單一元素。7 種 kind 各自需要不同欄位，切換 kind 時要重建物件
 * ——不然舊 kind 的欄位會殘留在資料裡，送出時驗證會失敗。
 */
const part = defineModel<PartDto>({ required: true })

const kindOptions: OptionBase<SelectValue>[] = (
  Object.keys(PART_KIND_LABELS) as PartKind[]
).map((kind) => ({ value: kind, text: PART_KIND_LABELS[kind] }))

/** 換種類時給一個乾淨的空殼，不要沿用舊欄位 */
const emptyPart = (kind: PartKind): PartDto => {
  switch (kind) {
    case 'heading':
      return { kind: 'heading', level: 5, text: '' }
    case 'list':
      return { kind: 'list', items: [''] }
    case 'paragraph':
      return { kind: 'paragraph', html: '' }
    case 'image':
      return { kind: 'image', image: { src: '' } }
    case 'imageText':
      return { kind: 'imageText', html: '', image: { src: '' } }
    case 'video':
      return { kind: 'video', src: '' }
  }
}

const kind = computed<SelectValue | SelectValue[] | null>({
  get: () => part.value.kind,
  set: (value) => {
    const next = String(value) as PartKind
    if (next !== part.value.kind) part.value = emptyPart(next)
  },
})

const levelOptions: OptionBase<SelectValue>[] = [
  { value: 4, text: '景點名稱（會出現在目錄）' },
  { value: 5, text: '小標題' },
  { value: 6, text: '評分' },
]

// 條列項目在表單上用「一行一個」編輯，比開一層 repeater 直覺
const listText = computed<string | null>({
  get: () => (part.value.kind === 'list' ? part.value.items.join('\n') : ''),
  set: (value) => {
    if (part.value.kind !== 'list') return
    part.value = {
      kind: 'list',
      items: (value ?? '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    }
  },
})

const level = computed<SelectValue | SelectValue[] | null>({
  get: () => (part.value.kind === 'heading' ? part.value.level : 5),
  set: (value) => {
    if (part.value.kind !== 'heading') return
    const next = Number(value)
    if (next === 4 || next === 5 || next === 6) part.value = { ...part.value, level: next }
  },
})
</script>

<template>
  <div class="part-editor">
    <BaseSelect v-model="kind" label="元素種類" :items="kindOptions" :hide-details="false" />

    <template v-if="part.kind === 'heading'">
      <BaseSelect v-model="level" label="層級" :items="levelOptions" :hide-details="false" />
      <BaseInput v-model="part.text" label="標題文字" required :hide-details="false" />
    </template>

    <BaseTextarea
      v-else-if="part.kind === 'list'"
      v-model="listText"
      label="條列內容"
      :rows="4"
      :hide-details="false"
      hint="一行一個項目。可用 <a> <u> <mark> 等行內標籤"
    />

    <BaseTextarea
      v-else-if="part.kind === 'paragraph'"
      v-model="part.html"
      label="段落內容"
      :rows="4"
      required
      :hide-details="false"
      hint="可用 <a> <u> <mark> <br> 等行內標籤"
    />

    <ImageFields v-else-if="part.kind === 'image'" v-model="part.image" />

    <template v-else-if="part.kind === 'imageText'">
      <BaseTextarea
        v-model="part.html"
        label="疊在圖片上的說明"
        :rows="2"
        :hide-details="false"
      />
      <ImageFields v-model="part.image" />
    </template>

    <BaseInput
      v-else-if="part.kind === 'video'"
      v-model="part.src"
      label="影片嵌入網址"
      type="url"
      required
      :hide-details="false"
      hint="YouTube 的 embed 網址，例如 https://www.youtube.com/embed/xxxx"
    />
  </div>
</template>

<style lang="scss" scoped>
.part-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
