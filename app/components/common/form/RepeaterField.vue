<script lang="ts" setup generic="T">
import BaseButton from '@/components/common/button/BaseButton.vue'
import BaseIconButton from '@/components/common/button/BaseIconButton.vue'

/**
 * 可新增／刪除／排序的清單欄位。
 * 景點、內文區塊、區塊內元素、三欄圖文都是這個形狀，抽出來共用。
 *
 * 每一項的內容由呼叫端用 `#item` slot 決定，這裡只管清單本身的操作。
 */
const props = defineProps<{
  label: string
  /** 新增按鈕的文字 */
  addLabel: string
  /** 建立一個空項目。由呼叫端提供，因為只有它知道該長什麼樣 */
  createItem: () => T
  /** 每一項標題列要顯示的文字 */
  itemLabel?: (item: T, index: number) => string
  /** 清單為空時的提示 */
  emptyText?: string
}>()

const items = defineModel<T[]>({ default: () => [] })

const add = () => {
  items.value = [...items.value, props.createItem()]
}

const remove = (index: number) => {
  items.value = items.value.filter((_, i) => i !== index)
}

const move = (index: number, offset: number) => {
  const target = index + offset
  if (target < 0 || target >= items.value.length) return
  const next = [...items.value]
  const [moved] = next.splice(index, 1)
  if (moved !== undefined) next.splice(target, 0, moved)
  items.value = next
}
</script>

<template>
  <fieldset class="repeater">
    <legend class="repeater__legend">{{ label }}</legend>

    <p v-if="!items.length" class="repeater__empty">{{ emptyText ?? '還沒有項目' }}</p>

    <div v-for="(item, index) in items" :key="index" class="repeater__item">
      <div class="repeater__bar">
        <span class="repeater__index">
          {{ itemLabel ? itemLabel(item, index) : `第 ${index + 1} 項` }}
        </span>
        <div class="repeater__actions">
          <BaseIconButton
            icon="mdi:arrow-up"
            :label="`上移第 ${index + 1} 項`"
            size="small"
            :disabled="index === 0"
            @click="move(index, -1)"
          />
          <BaseIconButton
            icon="mdi:arrow-down"
            :label="`下移第 ${index + 1} 項`"
            size="small"
            :disabled="index === items.length - 1"
            @click="move(index, 1)"
          />
          <BaseIconButton
            icon="mdi:trash-can-outline"
            :label="`刪除第 ${index + 1} 項`"
            size="small"
            @click="remove(index)"
          />
        </div>
      </div>

      <div class="repeater__body">
        <slot name="item" :item="item" :index="index" />
      </div>
    </div>

    <BaseButton
      :text="addLabel"
      styling="secondary"
      prepend-icon="mdi:plus"
      class="repeater__add"
      @click="add"
    />
  </fieldset>
</template>

<style lang="scss" scoped>
.repeater {
  padding: 0;
  margin: 0;
  border: 0;

  &__legend {
    @include subtitle2-bold;
    padding: 0;
    margin-bottom: 8px;
    color: var(--title);
  }

  &__empty {
    @include body2-regular;
    padding: 16px;
    margin-bottom: 12px;
    color: var(--placeholder);
    text-align: center;
    background-color: var(--container);
    border-radius: var(--border-radius-s);
  }

  &__item {
    margin-bottom: 12px;
    border: 1px solid var(--divider);
    border-radius: var(--border-radius-s);
  }

  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 4px 4px 12px;
    background-color: var(--container);
    border-bottom: 1px solid var(--divider);
  }

  &__index {
    @include body2-medium;
    color: var(--subtitle);
  }

  &__actions {
    display: flex;
    gap: 2px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  &__add {
    width: 100%;
  }
}
</style>
