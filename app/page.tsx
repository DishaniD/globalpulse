import { fetchTopHeadlines, fetchNewsByCategory, mapApiArticle } from '@/lib/newsApi'
import HeroSection from '@/components/HeroSection'
import CategorySection from '@/components/CategorySection'
import PositiveSection from '@/components/PositiveSection'

export const revalidate = 1800

export default async function HomePage() {
  const [topArticles, techArticles, sportsArticles, businessArticles, positiveArticles] = await Promise.allSettled([
    fetchTopHeadlines(6).then(articles => articles.map(a => mapApiArticle(a, 'world'))),
    fetchNewsByCategory('technology', 6).then(articles => articles.map(a => mapApiArticle(a, 'technology'))),
    fetchNewsByCategory('sports', 6).then(articles => articles.map(a => mapApiArticle(a, 'sports'))),
    fetchNewsByCategory('business', 6).then(articles => articles.map(a => mapApiArticle(a, 'business'))),
    fetchNewsByCategory('positive', 6).then(articles => articles.map(a => mapApiArticle(a, 'positive'))),
  ])

  const top = topArticles.status === 'fulfilled' ? topArticles.value : []
  const tech = techArticles.status === 'fulfilled' ? techArticles.value : []
  const sports = sportsArticles.status === 'fulfilled' ? sportsArticles.value : []
  const business = businessArticles.status === 'fulfilled' ? businessArticles.value : []
  const positive = positiveArticles.status === 'fulfilled' ? positiveArticles.value : []

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
