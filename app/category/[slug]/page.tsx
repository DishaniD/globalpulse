import { getArticlesByCategory } from '@/lib/db'
import { fetchNewsByCategory, mapApiArticle } from '@/lib/newsApi'
import { fetchConflictNews } from '@/lib/rssService'
import { saveArticles } from '@/lib/db'
import { Category } from '@/types'
import ArticleCard from '@/components/ArticleCard'
import { notFound } from 'next/navigation'

const VALID_CATEGORIES: Category[] = ['world', 'technology', 'sports', 'business', 'positive', 'conflicts']

const CATEGORY_INFO: Record<Category, { title: string; description: string; emoji: string; accent?: string }> = {
  world:     { title: 'World News',          description: 'Latest news from around the globe',                  emoji: '🌍' },
  technology:{ title: 'Technology',          description: 'Latest in tech, AI, and innovation',                  emoji: '💻' },
  sports:    { title: 'Sports',              description: 'Scores, highlights, and sports news',                 emoji: '⚽' },
  business:  { title: 'Business & Finance',  description: 'Markets, economy, and business news',                emoji: '📈' },
  positive:  { title: 'Positive News',       description: 'Uplifting and inspiring stories worldwide',          emoji: '🌟' },
  conflicts: { title: 'Breaking Conflicts',  description: 'Live coverage from Reuters, Al Jazeera, BBC & The Guardian', emoji: '💥', accent: 'red' },
  general:   { title: 'General',             description: 'Top headlines',                                       emoji: '📰' },
}

// Revalidate conflicts more frequently — every 15 minutes
export const revalidate = 900

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = slug as Category

  if (!VALID_CATEGORIES.includes(category)) notFound()

  const info = CATEGORY_INFO[category]
  const isConflicts = category === 'conflicts'

  // Get articles from DB first
  let articles = await getArticlesByCategory(category, 24)

  if (isConflicts) {
    // For conflicts: always try to get fresh RSS articles if DB has fewer than 9
    if (articles.length < 9) {
      try {
        const fresh = await fetchConflictNews(40)
        if (fresh.length > 0) {
          await saveArticles(fresh)
          const existingIds = new Set(articles.map(a => a.id))
          const newOnes = fresh.filter(a => !existingIds.has(a.id))
          articles = [...articles, ...newOnes]
        }
      } catch (e) {
        console.error('Failed to fetch conflict news:', e)
      }
    }
    // Sort by newest first
    articles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    articles = articles.slice(0, 24)
  } else {
    // Standard categories: fallback to TheNewsAPI if DB is thin
    if (articles.length < 9) {
      try {
        const fresh = await fetchNewsByCategory(category, 18)
        const mapped = fresh.map(a => mapApiArticle(a, category))
        if (mapped.length > 0) {
          await saveArticles(mapped)
          const existingIds = new Set(articles.map(a => a.id))
          const newOnes = mapped.filter(a => !existingIds.has(a.id))
          articles = [...articles, ...newOnes].slice(0, 18)
        }
      } catch (e) {
        console.error('Failed to fetch fresh articles:', e)
      }
    }
  }

  // Source breakdown for conflicts tab
  const sources = isConflicts
    ? ['Reuters', 'Al Jazeera', 'BBC World', 'The Guardian'].map(name => ({
        name,
        count: articles.filter(a => a.source === name).length,
      })).filter(s => s.count > 0)
    : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header — red accent for conflicts */}
      <div className={`mb-10 pb-6 border-b-2 ${isConflicts ? 'border-pulse' : 'border-ink'}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{info.emoji}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold">{info.title}</h1>
          {isConflicts && (
            <span className="ml-2 px-2 py-1 bg-pulse text-cream font-mono text-xs uppercase tracking-widest animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <p className="font-body text-ink/50 text-lg italic">{info.description}</p>

        {/* Source badges for conflicts */}
        {isConflicts && sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {sources.map(s => (
              <span key={s.name} className="font-mono text-xs px-2 py-1 border border-ink/20 text-ink/50">
                {s.name} · {s.count}
              </span>
            ))}
            <span className="font-mono text-xs text-ink/30 self-center ml-1">
              · {articles.length} total · updates every 15 min
            </span>
          </div>
        )}

        {!isConflicts && (
          <p className="font-mono text-xs text-ink/30 mt-2">{articles.length} articles</p>
        )}
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
          <p className="font-mono text-sm text-ink/20 mt-2">
            {isConflicts ? 'Run /api/sync-conflicts to fetch latest news' : 'Try syncing news first'}
          </p>
        </div>
      )}
    </div>
  )
}
