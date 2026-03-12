'use client'
import { Article, Category } from '@/types'
import ArticleCard from './ArticleCard'
import Link from 'next/link'

interface CategorySectionProps {
  title: string
  category: Category
  articles: Article[]
  emoji: string
  accent?: 'red' | 'default'
}

export default function CategorySection({ title, category, articles, emoji, accent = 'default' }: CategorySectionProps) {
  const isRed = accent === 'red'

  return (
    <section>
      <div className={`flex items-center gap-4 mb-6 pb-3 ${isRed ? 'border-b-2 border-pulse' : ''}`}>
        <span className="text-2xl">{emoji}</span>
        <h2 className={`font-display text-2xl font-bold ${isRed ? 'text-pulse' : ''}`}>{title}</h2>
        {isRed && (
          <span className="px-2 py-0.5 bg-pulse text-cream font-mono text-xs uppercase tracking-widest animate-pulse">
            LIVE
          </span>
        )}
        <div className={`flex-1 border-t-2 ${isRed ? 'border-pulse/30' : 'border-ink/10'}`} />
        <Link
          href={`/category/${category}`}
          className={`font-mono text-xs uppercase tracking-widest transition-colors ${
            isRed ? 'text-pulse hover:text-red-700' : 'text-pulse hover:text-pulse/70'
          }`}
        >
          See All →
        </Link>
      </div>
      <div className="news-grid stagger">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
