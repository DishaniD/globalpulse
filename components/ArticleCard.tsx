'use client'
import { Article } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import NewsImage from './NewsImage'

interface ArticleCardProps {
  article: Article
}

export function buildArticleUrl(article: Article) {
  return `/article/${article.id}?id=${article.id}&url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title)}&desc=${encodeURIComponent(article.description || '')}&img=${encodeURIComponent(article.image_url || '')}&source=${encodeURIComponent(article.source)}&cat=${encodeURIComponent(article.category)}&date=${encodeURIComponent(article.published_at)}`
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={buildArticleUrl(article)} className="group article-card block overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <NewsImage
          src={article.image_url}
          alt={article.title}
          category={article.category}
          className="w-full h-48 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="category-badge">{article.category}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="headline-link font-display text-lg leading-tight mb-2 line-clamp-2">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-sm text-ink/60 leading-relaxed line-clamp-2 mb-3">
            {article.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="font-mono text-xs text-ink/40 truncate max-w-[60%]">{article.source}</span>
          <span className="font-mono text-xs text-ink/40">
            {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  )
}
