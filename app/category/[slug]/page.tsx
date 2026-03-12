import { getArticlesByCategory } from '@/lib/db'
import { fetchNewsByCategory, mapApiArticle } from '@/lib/newsApi'
import { saveArticles } from '@/lib/db'
import { Category } from '@/types'
import ArticleCard from '@/components/ArticleCard'
import { notFound } from 'next/navigation'

const VALID_CATEGORIES: Category[] = ['world', 'technology', 'sports', 'business', 'positive']

const CATEGORY_INFO: Record<Category, { title: string; description: string; emoji: string }> = {
  world: { title: 'World News', description: 'Latest news from around the globe', emoji: '🌍' },
  technology: { title: 'Technology', description: 'Latest in tech, AI, and innovation', emoji: '💻' },
  sports: { title: 'Sports', description: 'Scores, highlights, and sports news', emoji: '⚽' },
  business: { title: 'Business & Finance', description: 'Markets, economy, and business news', emoji: '📈' },
  positive: { title: 'Positive News', description: 'Uplifting and inspiring stories worldwide', emoji: '🌟' },
  general: { title: 'General', description: 'Top headlines', emoji: '📰' },
}

export const revalidate = 1800

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = slug as Category

  if (!VALID_CATEGORIES.includes(category)) notFound()

  const info = CATEGORY_INFO[category]

  // First try to get articles from database (has history)
  let articles = await getArticlesByCategory(category, 18)

  // If DB is empty or has less than 9, fetch fresh from API and save
  if (articles.length < 9) {
    try {
      const fresh = await fetchNewsByCategory(category, 18)
      const mapped = fresh.map(a => mapApiArticle(a, category))
      if (mapped.length > 0) {
        await saveArticles(mapped)
        // Merge with existing, deduplicate by id
        const existingIds = new Set(articles.map(a => a.id))
        const newOnes = mapped.filter(a => !existingIds.has(a.id))
        articles = [...articles, ...newOnes].slice(0, 18)
      }
    } catch (e) {
      console.error('Failed to fetch fresh articles:', e)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 border-b-2 border-ink pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{info.emoji}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold">{info.title}</h1>
        </div>
        <p className="font-body text-ink/50 text-lg italic">{info.description}</p>
        <p className="font-mono text-xs text-ink/30 mt-2">{articles.length} articles</p>
      </div>

      {articles.length > 0 ? (
        <div className="news-grid stagger">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="font-display text-2xl text-ink/30">No articles found</p>
          <p className="font-mono text-sm text-ink/20 mt-2">Try syncing news first</p>
        </div>
      )}
    </div>
  )
}
