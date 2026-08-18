import db from '@/assets/data/db.json'
import type { Article } from '@/types/api/article'

/**
 * 文章資料來源。
 *
 * ⚠ 目前讀的是 legacy 搬過來的靜態 db.json（app/assets/data/db.json），
 *   之後要換成 GAS + Google Sheets。換的時候只動這個檔，元件與 composable 不用改。
 *   換法：改成繼承 ServiceBase 並用 this.get()／this.post()。
 */
const articles = db.articles as unknown as Article[]

export class ArticleService {
  async list(): Promise<Article[]> {
    return articles
  }

  async findByWeek(week: number): Promise<Article | null> {
    return articles.find((article) => article.week === week) ?? null
  }
}

export const articleService = new ArticleService()
