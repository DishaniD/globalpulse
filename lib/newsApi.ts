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
  conflicts: 'general',
}

// Filter out bad articles - no proper title, favicon-only images, or very old positive news
function isValidArticle(article: NewsApiArticle, category?: Category): boolean {
  // Must have a real title (not just the domain name)
  if (!article.title) return false
  if (article.title.toLowerCase() === article.source.toLowerCase()) return false
  if (article.title.endsWith('.ca') || article.title.endsWith('.com') || article.title.endsWith('.net')) return false

  // Must have some content
  if (!article.description && !article.snippet) return false

  // Filter favicon/icon images
  const img = article.image_url || ''
  if (img.includes('favicon') || img.includes('.ico') || img.includes('icon')) return false

  // Positive news: only show articles from last 30 days
  if (category === 'positive') {
    const published = new Date(article.published_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    if (published < thirtyDaysAgo) return false
  }

  return true
}

export async function fetchNewsByCategory(category: Category, limit = 9): Promise<NewsApiArticle[]> {
  // Conflicts uses RSS, not this API
  if (category === 'conflicts') return []

  const apiCategory = CATEGORY_MAP[category]

  // Fetch more than needed so we have enough after filtering
  const fetchLimit = Math.min(limit * 2, 50)

  const params = new URLSearchParams({
    api_token: THE_NEWS_API_KEY || '',
    categories: apiCategory,
    language: 'en',
    limit: String(fetchLimit),
    ...(category === 'positive' ? { search: 'breakthrough discovery achievement award rescue community success' } : {}),
  })

  const res = await fetch(`${BASE_URL}/top?${params}`, { next: { revalidate: 1800 } })
  if (!res.ok) throw new Error(`News API error: ${res.status}`)
  const data = await res.json()
  const articles: NewsApiArticle[] = data.data || []

  // Filter and return up to limit
  return articles.filter(a => isValidArticle(a, category)).slice(0, limit)
}

export async function fetchTopHeadlines(limit = 6): Promise<NewsApiArticle[]> {
  const fetchLimit = Math.min(limit * 2, 50)

  const params = new URLSearchParams({
    api_token: THE_NEWS_API_KEY || '',
    language: 'en',
    limit: String(fetchLimit),
  })

  const res = await fetch(`${BASE_URL}/top?${params}`, { next: { revalidate: 900 } })
  if (!res.ok) throw new Error(`News API error: ${res.status}`)
  const data = await res.json()
  const articles: NewsApiArticle[] = data.data || []

  return articles.filter(a => isValidArticle(a)).slice(0, limit)
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
