import db from '@/assets/data/articles.json'
import type { Article } from '@/types/api/article'

/**
 * 文章資料來源。
 *
 * ⚠ 目前讀的是 legacy 搬過來的靜態資料。articles.json 由 `npm run data:parse`
 *   從 db.json 產生（內文 HTML 已解析成結構化區塊），改內容要重跑那支腳本。
 *   之後換 GAS + Google Sheets 時只動這個檔，元件與 composable 不用改。
 */
const articles = db.articles as unknown as Article[]

export class ArticleService {
  async list(): Promise<Article[]> {
    return articles
  }

  async findByWeek(week: number): Promise<Article | null> {
    return articles.find((article) => article.week === week) ?? null
  }

  /** 文章頁的上一篇／下一篇。依 week 排序，頭尾各自沒有鄰居 */
  async findNeighbours(week: number): Promise<{ prev: Article | null; next: Article | null }> {
    const sorted = [...articles].sort((a, b) => a.week - b.week)
    const index = sorted.findIndex((article) => article.week === week)
    if (index === -1) return { prev: null, next: null }
    return {
      prev: sorted[index - 1] ?? null,
      next: sorted[index + 1] ?? null,
    }
  }
}

export const articleService = new ArticleService()
