import { Article, Category } from '@/types'
import ArticleCard from './ArticleCard'
import Link from 'next/link'

interface CategorySectionProps {
  title: string
  category: Category
  articles: Article[]
  emoji: string
}

export default function CategorySection({ title, category, articles, emoji }: CategorySectionProps) {
  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-2xl">{emoji}</span>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <div className="flex-1 border-t-2 border-ink/10" />
        <Link
          href={`/category/${category}`}
          className="font-mono text-xs uppercase tracking-widest text-pulse hover:text-pulse/70 transition-colors"
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
