import { computed, ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'

// 全域的請求載入遮罩。以計數器實作，允許多個請求同時進行。
const createFetchLoadingStore = () => {
  const count = ref(0)

  const start = () => {
    count.value += 1
  }
  const finish = () => {
    count.value = Math.max(0, count.value - 1)
  }
  /** 包住一個非同步工作，結束後自動收掉遮罩 */
  const wrap = async <T>(task: () => Promise<T>): Promise<T> => {
    start()
    try {
      return await task()
    } finally {
      finish()
    }
  }

  return {
    isLoading: computed(() => count.value > 0),
    start,
    finish,
    wrap,
  }
}

type FetchLoadingStore = ReturnType<typeof createFetchLoadingStore>

export const useFetchLoading = (): FetchLoadingStore => {
  const store = useNuxtApp().$fetchLoadingStore as FetchLoadingStore
  if (!store) throw new Error('FetchLoading store not found')
  return store
}

export { createFetchLoadingStore }
