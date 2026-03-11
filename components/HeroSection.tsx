'use client'
import { Article } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import NewsImage from './NewsImage'

interface HeroSectionProps {
  articles: Article[]
}

function buildArticleUrl(article: Article) {
  return `/article/${article.id}?url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title)}&desc=${encodeURIComponent(article.description || '')}&img=${encodeURIComponent(article.image_url || '')}&source=${encodeURIComponent(article.source)}&cat=${encodeURIComponent(article.category)}&date=${encodeURIComponent(article.published_at)}`
}

export default function HeroSection({ articles }: HeroSectionProps) {
  const [hero, ...rest] = articles

  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-display text-3xl font-bold">Top Stories</h2>
        <div className="flex-1 border-t-2 border-ink/10" />
        <span className="font-mono text-xs uppercase tracking-widest text-ink/40">World News</span>
      </div>

      <div className="hero-grid">
        {/* Main hero article */}
        {hero && (
          <Link href={buildArticleUrl(hero)} className="group block">
            <div className="relative h-[420px] overflow-hidden">
              <NewsImage
                src={hero.image_url}
                alt={hero.title}
                category={hero.category}
                className="w-full h-[420px] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="category-badge mb-3 inline-block">{hero.category}</span>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-cream leading-tight mb-2 group-hover:text-gold transition-colors">
                  {hero.title}
                </h1>
                <p className="text-cream/70 text-sm font-mono">
                  {hero.source} · {formatDistanceToNow(new Date(hero.published_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Side articles */}
        <div className="flex flex-col gap-4">
          {rest.slice(0, 4).map(article => (
            <Link
              key={article.id}
              href={buildArticleUrl(article)}
              className="group flex gap-4 border-b border-ink/10 pb-4 last:border-0"
            >
              <div className="w-24 h-20 flex-shrink-0 overflow-hidden">
                <NewsImage
                  src={article.image_url}
                  alt={article.title}
                  category={article.category}
                  className="w-24 h-20 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-mono text-xs text-pulse uppercase tracking-wider">{article.category}</span>
                <h3 className="font-display font-bold text-sm leading-tight mt-1 group-hover:text-pulse transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="font-mono text-xs text-ink/40 mt-1">
                  {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
