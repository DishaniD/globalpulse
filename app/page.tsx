import { getArticlesByCategory, getTopHeadlines } from '@/lib/db'
import { fetchTopHeadlines, fetchNewsByCategory, mapApiArticle } from '@/lib/newsApi'
import { saveArticles } from '@/lib/db'
import HeroSection from '@/components/HeroSection'
import CategorySection from '@/components/CategorySection'
import PositiveSection from '@/components/PositiveSection'
import { Category } from '@/types'

export const revalidate = 1800

async function getOrFetch(category: Category, limit: number) {
  // Try DB first
  let articles = await getArticlesByCategory(category, limit)

  // If not enough, fetch from API and save
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

export default async function HomePage() {
  // Get top headlines from DB
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

  const [tech, sports, business, positive] = await Promise.all([
    getOrFetch('technology', 6),
    getOrFetch('sports', 6),
    getOrFetch('business', 6),
    getOrFetch('positive', 6),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {top.length > 0 && <HeroSection articles={top} />}

      <div className="section-divider" />

      <div className="space-y-12">
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
