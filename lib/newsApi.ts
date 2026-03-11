import { NewsApiArticle, Article, Category } from '@/types'

const THE_NEWS_API_KEY = process.env.THE_NEWS_API_KEY
const BASE_URL = 'https://api.thenewsapi.com/v1/news'

const CATEGORY_MAP: Record<Category, string> = {
  world: 'general',
  technology: 'tech',
  sports: 'sports',
  business: 'business',
  positive: 'general',
  general: 'general',
}

export async function fetchNewsByCategory(category: Category, limit = 9): Promise<NewsApiArticle[]> {
  const apiCategory = CATEGORY_MAP[category]
  const params = new URLSearchParams({
    api_token: THE_NEWS_API_KEY || '',
    categories: apiCategory,
    language: 'en',
    limit: String(limit),
    ...(category === 'positive' ? { search: 'positive good news hope inspiring' } : {}),
  })

  const res = await fetch(`${BASE_URL}/top?${params}`, { next: { revalidate: 1800 } })
  if (!res.ok) throw new Error(`News API error: ${res.status}`)
  const data = await res.json()
  return data.data || []
}

export async function fetchTopHeadlines(limit = 20): Promise<NewsApiArticle[]> {
  const params = new URLSearchParams({
    api_token: THE_NEWS_API_KEY || '',
    language: 'en',
    limit: String(limit),
  })

  const res = await fetch(`${BASE_URL}/top?${params}`, { next: { revalidate: 900 } })
  if (!res.ok) throw new Error(`News API error: ${res.status}`)
  const data = await res.json()
  return data.data || []
}

export function mapApiArticle(article: NewsApiArticle, category: Category): Article {
  return {
    id: article.uuid,
    title: article.title,
    original_title: article.title,
    description: article.description || article.snippet,
    ai_summary: '',
    ai_rewritten: '',
    content: article.snippet,
    url: article.url,
    image_url: article.image_url || '',
    published_at: article.published_at,
    source: article.source,
    category,
    keywords: article.keywords ? article.keywords.split(',').map(k => k.trim()) : [],
  }
}
