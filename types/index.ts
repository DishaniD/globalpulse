export interface Article {
  id: string
  title: string
  original_title: string
  description: string
  ai_summary: string
  ai_rewritten: string
  content: string
  url: string
  image_url: string
  ai_image_url?: string
  published_at: string
  source: string
  category: string
  author?: string
  keywords?: string[]
}

export type Category = 'world' | 'technology' | 'sports' | 'business' | 'positive' | 'conflicts' | 'general'

export interface NewsApiResponse {
  meta: { found: number; returned: number; limit: number; page: number }
  data: NewsApiArticle[]
}

export interface NewsApiArticle {
  uuid: string
  title: string
  description: string
  keywords: string
  snippet: string
  url: string
  image_url: string
  language: string
  published_at: string
  source: string
  categories: string[]
  relevance_score: number | null
  locale: string
}

export interface RssArticle {
  id: string
  title: string
  description: string
  url: string
  image_url: string
  published_at: string
  source: string
  category: 'conflicts'
}
