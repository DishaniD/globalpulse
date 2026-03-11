import { fetchNewsByCategory, mapApiArticle } from '@/lib/newsApi'
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
  params: { slug: string }
}

export default async function CategoryPage({ params }: PageProps) {
  const category = params.slug as Category

  if (!VALID_CATEGORIES.includes(category)) notFound()

  const info = CATEGORY_INFO[category]
  const rawArticles = await fetchNewsByCategory(category, 12)
  const articles = rawArticles.map(a => mapApiArticle(a, category))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10 border-b-2 border-ink pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{info.emoji}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold">{info.title}</h1>
        </div>
        <p className="font-body text-ink/50 text-lg italic">{info.description}</p>
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
          <p className="font-mono text-sm text-ink/20 mt-2">Check your API key or try again later</p>
        </div>
      )}
    </div>
  )
}
