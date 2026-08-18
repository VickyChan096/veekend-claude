import { computed } from 'vue'
import { createError, useAsyncData } from 'nuxt/app'
import { articleService } from '@/services/pages/ArticleService'
import type { Article } from '@/types/api/article'

/**
 * 文章清單。用 useAsyncData 包起來，nuxt generate 時就抓完寫進靜態頁，
 * client 端直接吃 payload，不會再打一次。
 */
export const useArticles = async () => {
  const { data, error } = await useAsyncData('articles', () => articleService.list())

  /**
   * ⚠ useAsyncData 會把錯誤收進 error ref 而不是往外拋，所以 service 裡的 throw
   *   到不了這裡。不主動檢查的話，GAS 掛掉時會靜悄悄產出一個沒有文章的網站
   *   ——建置照樣回報成功，只是路由數從 36 掉到 12。
   */
  if (import.meta.server && (error.value || !data.value?.length)) {
    throw createError({
      statusCode: 500,
      statusMessage: `建置時讀不到文章資料：${error.value?.message ?? '回傳是空的'}`,
      fatal: true,
    })
  }

  const articles = computed<Article[]>(() => data.value ?? [])

  /** header 選單用：依縣市分組，台北市與新北市各自一組，其餘歸「其他」 */
  const groupedByCity = computed(() => {
    const taipei: Article[] = []
    const newTaipei: Article[] = []
    const other: Article[] = []

    articles.value.forEach((article) => {
      if (article.city === '台北市') taipei.push(article)
      else if (article.city === '新北市') newTaipei.push(article)
      else other.push(article)
    })

    return { taipei, newTaipei, other }
  })

  /** 側欄用：所有 hashTag 依出現次數由多到少，取前 10 個 */
  const topHashTags = computed(() => {
    const counted = new Map<string, number>()
    articles.value.forEach((article) => {
      article.hashTags.forEach((tag) => counted.set(tag, (counted.get(tag) ?? 0) + 1))
    })
    return [...counted.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag)
  })

  /** 首頁地圖用：所有文章的景點去重（以 mapUrl 為準） */
  const allDestinations = computed(() => {
    const seen = new Set<string>()
    return articles.value
      .flatMap((article) => article.destinations)
      .filter((destination) => {
        if (seen.has(destination.mapUrl)) return false
        seen.add(destination.mapUrl)
        return true
      })
  })

  return { articles, groupedByCity, topHashTags, allDestinations }
}
