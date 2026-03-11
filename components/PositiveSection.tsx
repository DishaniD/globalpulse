'use client'
import { Article } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import NewsImage from './NewsImage'

interface PositiveSectionProps {
  articles: Article[]
}

function buildArticleUrl(article: Article) {
  return `/article/${article.id}?url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title)}&desc=${encodeURIComponent(article.description || '')}&img=${encodeURIComponent(article.image_url || '')}&source=${encodeURIComponent(article.source)}&cat=${encodeURIComponent(article.category)}&date=${encodeURIComponent(article.published_at)}`
}

export default function PositiveSection({ articles }: PositiveSectionProps) {
  return (
    <section className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 p-8 rounded-sm">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-2xl">🌟</span>
        <h2 className="font-display text-2xl font-bold">Positive News</h2>
        <div className="flex-1 border-t-2 border-gold/20" />
        <Link href="/category/positive" className="font-mono text-xs uppercase tracking-widest text-gold hover:text-gold/70 transition-colors">
          See All →
        </Link>
      </div>
      <p className="font-body text-ink/60 italic mb-6">Good things happening around the world</p>
      <div className="news-grid stagger">
        {articles.map(article => (
          <Link
            key={article.id}
            href={buildArticleUrl(article)}
            className="group block bg-white border border-gold/20 overflow-hidden hover:border-gold/50 hover:shadow-md transition-all duration-300"
          >
            <div className="h-40 overflow-hidden">
              <NewsImage
                src={article.image_url}
                alt={article.title}
                category="positive"
                className="w-full h-40 group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h3 className="font-display font-bold leading-tight group-hover:text-gold transition-colors mb-2">
                {article.title}
              </h3>
              <p className="font-mono text-xs text-ink/40">
                {article.source} · {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
