<script lang="ts" setup>
import { computed, ref } from 'vue'
import { navigateTo, useHead } from 'nuxt/app'
import BaseInput from '@/components/common/input/BaseInput.vue'
import BaseTextarea from '@/components/common/textarea/BaseTextarea.vue'
import BaseCheckbox from '@/components/common/checkbox/BaseCheckbox.vue'
import BaseButton from '@/components/common/button/BaseButton.vue'
import BaseDatepicker from '@/components/common/date/BaseDatepicker.vue'
import RepeaterField from '@/components/common/form/RepeaterField.vue'
import BlockEditor from '@/components/pages/edit/BlockEditor.vue'
import LayoutGuideDialog from '@/components/pages/edit/LayoutGuideDialog.vue'
import { useAuth } from '@/composables/common/useAuth'
import { useAlert } from '@/composables/common/useAlert'
import { articleWriteService } from '@/services/pages/ArticleWriteService'
import type { ArticleDto, BlockDto, DestinationDto } from '@/types/api/dto/article.dto'

/**
 * 文章編輯頁。
 *
 * ⚠ **送出只會把資料印到 console，不會真的寫進 Sheets。**
 *   原因見 `ArticleWriteService` 與 `docs/gas-setup.md` 的「重要限制」。
 *
 * 這頁的價值在於：表單 → DTO → Service 的分層已經接好，之後搬到有後端的環境時
 * 只要換掉 `ArticleWriteService.save()` 與 `useAuth()`，這個檔案不用動。
 *
 * 存取控制由 `app/middleware/auth.global.ts` 依路徑清單負責。
 */
const { userName, logout } = useAuth()
const { openAlert } = useAlert()

const emptyDestination = (): DestinationDto => ({
  name: '',
  rate: 4,
  mapUrl: '',
  lat: 25.033,
  lng: 121.5654,
})

const emptyBlock = (): BlockDto => ({
  type: 'section',
  layout: 'imageFirst',
  parts: [{ kind: 'paragraph', html: '' }],
})

// 表單狀態直接用 DTO 的形狀，送出時不用再轉一次
const form = ref<ArticleDto>({
  week: 13,
  title: '',
  city: '',
  district: '',
  visitedDate: '',
  writtenDate: '',
  userName: 'VC',
  briefing: '',
  largeCoverUrl: '',
  smallCoverUrl: '',
  hashTags: [],
  published: false,
  destinations: [],
  blocks: [],
})

// 標籤在表單上用逗號分隔編輯，比開一層 repeater 直覺
const hashTagsText = computed<string | number | null>({
  get: () => form.value.hashTags.join(', '),
  set: (value) => {
    form.value.hashTags = String(value ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  },
})

const layoutGuideOpen = ref(false)
const errors = ref<{ path: string; message: string }[]>([])
const submitting = ref(false)

const submit = async () => {
  submitting.value = true
  errors.value = []
  try {
    const result = await articleWriteService.save(form.value)

    if (!result.ok) {
      errors.value = result.errors
      openAlert({
        type: 'error',
        title: '還有欄位沒填好',
        text: `共 ${result.errors.length} 個問題，請看下方清單`,
      })
      return
    }

    openAlert({
      type: 'success',
      title: '已送出（示範）',
      text: '資料通過驗證，內容已印在瀏覽器的開發者工具 Console',
      timer: true,
    })
  } finally {
    submitting.value = false
  }
}

const signOut = async () => {
  logout()
  await navigateTo('/login')
}

const destinationLabel = (destination: DestinationDto, index: number) =>
  destination.name || `第 ${index + 1} 個景點`

const blockLabel = (block: BlockDto, index: number) =>
  `${index + 1}. ${block.type === 'gallery' ? '三欄圖文' : block.layout}`

useHead({ title: '編輯文章 | Veekend' })
</script>

<template>
  <div class="edit">
    <header class="edit__head">
      <div>
        <h1>編輯文章</h1>
        <p class="edit__who">目前登入：{{ userName }}</p>
      </div>
      <BaseButton text="登出" styling="text" size="small" @click="signOut" />
    </header>

    <p class="edit__notice">
      <Icon name="mdi:information-outline" aria-hidden="true" />
      <span>
        這是<strong>示範用的編輯頁</strong>。送出只會把通過驗證的資料印到瀏覽器的
        Console，不會真的寫進 Google 試算表——純靜態網站無法安全保管寫入金鑰。
        實際新增內容請直接編輯試算表。
      </span>
    </p>

    <form class="edit__form" @submit.prevent="submit">
      <section class="edit__section">
        <h2>基本資訊</h2>
        <div class="edit__grid">
          <BaseInput v-model="form.week" label="週次" type="number" required :hide-details="false" />
          <BaseInput v-model="form.userName" label="作者" required :hide-details="false" />
          <BaseInput v-model="form.city" label="縣市" required :hide-details="false" />
          <BaseInput v-model="form.district" label="區域" required :hide-details="false" />
          <BaseDatepicker v-model="form.visitedDate" label="造訪日期" :hide-details="false" />
          <!--
            撰寫日期刻意用文字輸入而非日曆：legacy 資料裡有 2022.12.?? 這種
            「只記得月份」的值，DTO 也允許，但日曆選不出來。
          -->
          <BaseInput
            v-model="form.writtenDate"
            label="撰寫日期"
            required
            :hide-details="false"
            hint="格式 2026.08.19；只記得月份可寫 2026.08.??"
          />
        </div>

        <BaseInput v-model="form.title" label="標題" required :hide-details="false" hint="可用 <br> 斷行、<strong> 強調" />
        <BaseTextarea v-model="form.briefing" label="摘要" :rows="3" required :hide-details="false" />

        <div class="edit__grid">
          <BaseInput
            v-model="form.largeCoverUrl"
            label="封面圖"
            required
            :hide-details="false"
            hint="例如 images/week13/cover.jpg"
          />
          <BaseInput
            v-model="form.smallCoverUrl"
            label="側欄小圖"
            required
            :hide-details="false"
            hint="例如 images/week13/cover-s.jpg"
          />
        </div>

        <BaseInput
          v-model="hashTagsText"
          label="標籤"
          :hide-details="false"
          hint="用逗號分隔，例如：台北市, 咖啡廳, 早午餐"
        />

        <BaseCheckbox v-model="form.published" label="發佈（不勾選的話不會出現在網站上）" />
      </section>

      <section class="edit__section">
        <h2>景點</h2>
        <RepeaterField
          v-model="form.destinations"
          label="本週景點"
          add-label="新增景點"
          empty-text="還沒有景點。地圖與文章開頭的目錄都會用到這些資料"
          :create-item="emptyDestination"
          :item-label="destinationLabel"
        >
          <template #item="{ index }">
            <BaseInput v-model="form.destinations[index]!.name" label="名稱" required :hide-details="false" />
            <BaseInput
              v-model="form.destinations[index]!.rate"
              label="評分"
              type="number"
              :hide-details="false"
              hint="0 到 5"
            />
            <BaseInput
              v-model="form.destinations[index]!.mapUrl"
              label="地圖網址"
              type="url"
              required
              :hide-details="false"
            />
            <div class="edit__grid">
              <BaseInput
                v-model="form.destinations[index]!.lat"
                label="緯度"
                type="number"
                :hide-details="false"
                hint="台灣本島約 21.9 ~ 25.3"
              />
              <BaseInput
                v-model="form.destinations[index]!.lng"
                label="經度"
                type="number"
                :hide-details="false"
                hint="台灣本島約 120.0 ~ 122.0"
              />
            </div>
          </template>
        </RepeaterField>
      </section>

      <section class="edit__section">
        <div class="edit__section-head">
          <h2>內文</h2>
          <BaseButton
            text="版型速查"
            styling="secondary"
            size="small"
            prepend-icon="mdi:view-dashboard-outline"
            @click="layoutGuideOpen = true"
          />
        </div>
        <RepeaterField
          v-model="form.blocks"
          label="內文區塊"
          add-label="新增區塊"
          empty-text="還沒有內文。未完成的文章可以留空，發佈後會顯示「趕稿中」"
          :create-item="emptyBlock"
          :item-label="blockLabel"
        >
          <template #item="{ index }">
            <BlockEditor v-model="form.blocks[index]!" />
          </template>
        </RepeaterField>
      </section>

      <section v-if="errors.length" class="edit__errors" role="alert">
        <h2>驗證沒過（{{ errors.length }} 項）</h2>
        <ul>
          <li v-for="(issue, index) in errors" :key="index">
            <code>{{ issue.path || '(整份資料)' }}</code>
            <span>{{ issue.message }}</span>
          </li>
        </ul>
      </section>

      <div class="edit__actions">
        <BaseButton text="送出（印到 Console）" type="submit" :loading="submitting" />
        <p class="edit__hint">按 F12 打開開發者工具的 Console 分頁看結果</p>
      </div>
    </form>

    <LayoutGuideDialog v-model="layoutGuideOpen" />
  </div>
</template>

<style lang="scss" scoped>
.edit {
  max-width: 900px;
  padding: 40px 30px 80px;
  margin: 0 auto;
  background-color: var(--surface);

  @include mobile {
    padding: 24px 15px 60px;
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;

    h1 {
      @include display;
      font-size: 40px;
      color: var(--title);
    }
  }

  &__who {
    @include body2-regular;
    color: var(--subtitle);
  }

  &__notice {
    @include body2-regular;
    display: flex;
    gap: 8px;
    padding: 12px;
    margin-bottom: 32px;
    color: var(--font);
    background-color: var(--primary-container);
    border-left: 4px solid var(--primary);
    border-radius: var(--border-radius-s);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 20px;

    > h2,
    > .edit__section-head {
      @include head2-bold;
      padding-bottom: 8px;
      color: var(--title);
      border-bottom: 2px solid var(--primary);
    }
  }

  // 標題與「版型速查」按鈕同一列
  &__section-head {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__errors {
    padding: 16px;
    background-color: var(--red1-container);
    border-left: 4px solid var(--red1);
    border-radius: var(--border-radius-s);

    h2 {
      @include body1-bold;
      margin-bottom: 8px;
      color: var(--red1);
    }

    li {
      @include body2-regular;
      display: flex;
      gap: 8px;
      margin-bottom: 4px;
    }

    code {
      color: var(--subtitle);
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  &__hint {
    @include body2-regular;
    color: var(--placeholder);
  }
}
</style>
