import { computed } from 'vue'
import type { Ref } from 'vue'
import type { LocationQuery } from 'vue-router'
import type { Article } from '@/types/api/article'

/**
 * 搜尋結果頁的篩選邏輯。對應 legacy 的 js/result.js。
 *
 * 三種模式（沿用 legacy 的 query 形式）：
 * - `?tags=咖啡廳`  精確比對 hashTags
 * - `?all=台北市`   依縣市；「其他」＝台北市與新北市以外
 * - `?search=丸林`  模糊比對縣市／區域／標題／摘要／內文／標籤
 *
 * 純靜態站的 query 只有 client 端才拿得到，所以呼叫端要把結果包在
 * <ClientOnly> 裡；搜尋結果本來也不需要 SEO。
 */
export type SearchMode = 'tags' | 'all' | 'search' | 'none'

const CITY_TAIPEI = '台北市'
const CITY_NEW_TAIPEI = '新北市'

const firstValue = (value: LocationQuery[string] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export const useArticleSearch = (articles: Ref<Article[]>, query: Ref<LocationQuery>) => {
  const mode = computed<SearchMode>(() => {
    if ('tags' in query.value) return 'tags'
    if ('all' in query.value) return 'all'
    if ('search' in query.value) return 'search'
    return 'none'
  })

  const keyword = computed(() => {
    if (mode.value === 'none') return ''
    return firstValue(query.value[mode.value]).trim()
  })

  const matchesSearch = (article: Article, needle: string) => {
    const haystacks = [
      article.city,
      article.district,
      article.title,
      article.briefing,
      // legacy 是對原始 HTML 做 indexOf，會誤中標記文字；改用腳本產生的純文字索引
      article.searchText,
      ...article.hashTags,
    ]
    return haystacks.some((text) => text.includes(needle))
  }

  const results = computed<Article[]>(() => {
    if (mode.value === 'none') return articles.value
    if (!keyword.value) return []

    switch (mode.value) {
      case 'tags':
        return articles.value.filter((article) => article.hashTags.includes(keyword.value))
      case 'all':
        return articles.value.filter((article) => {
          if (keyword.value === '其他') {
            return article.city !== CITY_TAIPEI && article.city !== CITY_NEW_TAIPEI
          }
          return article.city === keyword.value
        })
      case 'search':
        return articles.value.filter((article) => matchesSearch(article, keyword.value))
      default:
        return []
    }
  })

  /** 標題列要顯示的字。沒帶 query 時當成「全部文章」頁 */
  const heading = computed(() => (mode.value === 'none' ? '全部文章' : keyword.value))

  return { mode, keyword, results, heading }
}
