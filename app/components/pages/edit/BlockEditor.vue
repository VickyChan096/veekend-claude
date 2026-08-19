<script lang="ts" setup>
import { computed } from 'vue'
import BaseInput from '@/components/common/input/BaseInput.vue'
import BaseTextarea from '@/components/common/textarea/BaseTextarea.vue'
import BaseSelect from '@/components/common/select/BaseSelect.vue'
import RepeaterField from '@/components/common/form/RepeaterField.vue'
import PartEditor from '@/components/pages/edit/PartEditor.vue'
import ImageFields from '@/components/pages/edit/ImageFields.vue'
import { SECTION_LAYOUT_LABELS } from '@/types/api/dto/article.dto'
import type {
  BlockDto,
  GalleryItemDto,
  PartDto,
  SectionLayoutDto,
} from '@/types/api/dto/article.dto'
import type { OptionBase, SelectValue } from '@/types/common/form/OptionBase'

// 內文的單一區塊。section（有版面與元素）與 gallery（三欄圖文）兩種
const block = defineModel<BlockDto>({ required: true })

const typeOptions: OptionBase<SelectValue>[] = [
  { value: 'section', text: '一般區塊' },
  { value: 'gallery', text: '三欄圖文' },
]

const layoutOptions: OptionBase<SelectValue>[] = (
  Object.keys(SECTION_LAYOUT_LABELS) as SectionLayoutDto[]
).map((layout) => ({ value: layout, text: SECTION_LAYOUT_LABELS[layout] }))

/** 換型別時整個重建，不要沿用另一種的欄位 */
const blockType = computed<SelectValue | SelectValue[] | null>({
  get: () => block.value.type,
  set: (value) => {
    const next = String(value)
    if (next === block.value.type) return
    block.value =
      next === 'gallery'
        ? { type: 'gallery', items: [emptyGalleryItem()] }
        : { type: 'section', layout: 'imageFirst', parts: [emptyPart()] }
  },
})

const layout = computed<SelectValue | SelectValue[] | null>({
  get: () => (block.value.type === 'section' ? block.value.layout : 'imageFirst'),
  set: (value) => {
    if (block.value.type !== 'section') return
    block.value = { ...block.value, layout: String(value) as SectionLayoutDto }
  },
})

const emptyPart = (): PartDto => ({ kind: 'paragraph', html: '' })
const emptyGalleryItem = (): GalleryItemDto => ({ image: { src: '' } })

const partLabel = (part: PartDto, index: number) => `${index + 1}. ${part.kind}`
</script>

<template>
  <div class="block-editor">
    <BaseSelect v-model="blockType" label="區塊型別" :items="typeOptions" :hide-details="false" />

    <template v-if="block.type === 'section'">
      <BaseSelect v-model="layout" label="版面" :items="layoutOptions" :hide-details="false" />

      <BaseInput
        v-model="block.anchorId"
        label="錨點 ID"
        :hide-details="false"
        hint="填了才會出現在文章開頭的目錄裡，例如 dest1。目錄文字取自本區塊的「景點名稱」標題"
      />

      <RepeaterField
        v-model="block.parts"
        label="區塊內容"
        add-label="新增元素"
        empty-text="這個區塊還沒有內容"
        :create-item="emptyPart"
        :item-label="partLabel"
      >
        <template #item="{ index }">
          <PartEditor v-model="block.parts[index]!" />
        </template>
      </RepeaterField>
    </template>

    <RepeaterField
      v-else
      v-model="block.items"
      label="三欄圖文"
      add-label="新增一欄"
      empty-text="還沒有欄位"
      :create-item="emptyGalleryItem"
    >
      <template #item="{ index }">
        <BaseInput
          v-model="block.items[index]!.heading"
          label="小標題"
          :hide-details="false"
        />
        <BaseTextarea
          v-model="block.items[index]!.html"
          label="說明文字"
          :rows="3"
          :hide-details="false"
        />
        <ImageFields v-model="block.items[index]!.image" />
      </template>
    </RepeaterField>
  </div>
</template>

<style lang="scss" scoped>
.block-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
