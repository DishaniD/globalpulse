'use client'
import { useEffect, useState } from 'react'
import { Article } from '@/types'
import ArticleCard from '@/components/ArticleCard'
import Link from 'next/link'

export default function BookmarksPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState('')

  useEffect(() => {
    let s = localStorage.getItem('gp_session')
    if (!s) {
      s = Math.random().toString(36).slice(2)
      localStorage.setItem('gp_session', s)
    }
    setSession(s)

    fetch(`/api/bookmarks?session=${s}`)
      .then(r => r.json())
      .then(d => {
        setArticles(d.bookmarks || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 border-b-2 border-ink pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">★</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold">Saved Articles</h1>
        </div>
        <p className="font-body text-ink/50 text-lg italic">Your bookmarked stories</p>
      </div>

      {loading && (
        <div className="news-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-ink/5 animate-pulse rounded" />
          ))}
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div className="text-center py-24">
          <p className="font-display text-3xl text-ink/20 mb-4">No saved articles yet</p>
          <p className="font-mono text-sm text-ink/30 mb-8">Click "☆ Save" on any article to bookmark it</p>
          <Link href="/" className="bg-ink text-cream font-mono text-sm px-6 py-3 hover:bg-pulse transition-colors">
            Browse News →
          </Link>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div className="news-grid stagger">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
