import { getArticlesByCategory, getTopHeadlines } from '@/lib/db'
import { fetchTopHeadlines, fetchNewsByCategory, mapApiArticle } from '@/lib/newsApi'
import { fetchConflictNews } from '@/lib/rssService'
import { saveArticles } from '@/lib/db'
import HeroSection from '@/components/HeroSection'
import CategorySection from '@/components/CategorySection'
import PositiveSection from '@/components/PositiveSection'
import { Category } from '@/types'

export const revalidate = 900

async function getOrFetch(category: Category, limit: number) {
  let articles = await getArticlesByCategory(category, limit)
  if (articles.length < 3) {
    try {
      const fresh = await fetchNewsByCategory(category, limit * 2)
      const mapped = fresh.map(a => mapApiArticle(a, category))
      if (mapped.length > 0) {
        await saveArticles(mapped)
        articles = mapped.slice(0, limit)
      }
    } catch (e) {
      console.error(`Failed to fetch ${category}:`, e)
    }
  }
  return articles.slice(0, limit)
}

async function getOrFetchConflicts(limit: number) {
  let articles = await getArticlesByCategory('conflicts', limit)
  if (articles.length < 3) {
    try {
      const fresh = await fetchConflictNews(limit * 2)
      if (fresh.length > 0) {
        await saveArticles(fresh)
        articles = fresh.slice(0, limit)
      }
    } catch (e) {
      console.error('Failed to fetch conflicts:', e)
    }
  }
  // Always sort by newest
  articles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  return articles.slice(0, limit)
}

export default async function HomePage() {
  let top = await getTopHeadlines(6)
  if (top.length < 3) {
    try {
      const fresh = await fetchTopHeadlines(12)
      const mapped = fresh.map(a => mapApiArticle(a, 'world'))
      if (mapped.length > 0) {
        await saveArticles(mapped)
        top = mapped.slice(0, 6)
      }
    } catch (e) {
      console.error('Failed to fetch headlines:', e)
    }
  }

  const [tech, sports, business, positive, conflicts] = await Promise.all([
    getOrFetch('technology', 6),
    getOrFetch('sports', 6),
    getOrFetch('business', 6),
    getOrFetch('positive', 6),
    getOrFetchConflicts(6),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {top.length > 0 && <HeroSection articles={top} />}

      <div className="section-divider" />

      <div className="space-y-12">
        {/* Breaking Conflicts — shown first, red accent */}
        {conflicts.length > 0 && (
          <CategorySection
            title="Breaking Conflicts"
            category="conflicts"
            articles={conflicts}
            emoji="💥"
            accent="red"
          />
        )}
        {tech.length > 0 && (
          <CategorySection title="Technology" category="technology" articles={tech} emoji="💻" />
        )}
        {sports.length > 0 && (
          <CategorySection title="Sports" category="sports" articles={sports} emoji="⚽" />
        )}
        {business.length > 0 && (
          <CategorySection title="Business & Finance" category="business" articles={business} emoji="📈" />
        )}
        {positive.length > 0 && (
          <PositiveSection articles={positive} />
        )}
      </div>
    </div>
  )
}
