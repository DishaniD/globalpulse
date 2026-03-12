'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Article } from '@/types'
import ArticleCard from '@/components/ArticleCard'
import { Suspense } from 'react'

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [inputValue, setInputValue] = useState(initialQuery)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setArticles(data.articles || [])
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery)
  }, [initialQuery, doSearch])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim()) return
    setQuery(inputValue)
    router.push(`/search?q=${encodeURIComponent(inputValue)}`)
    doSearch(inputValue)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Search</h1>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex gap-0">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Search articles, topics, sources..."
            className="flex-1 px-5 py-4 border-2 border-ink bg-white font-body text-lg focus:outline-none focus:border-pulse transition-colors"
          />
          <button type="submit"
            className="px-8 py-4 bg-ink text-cream font-mono text-sm uppercase tracking-widest hover:bg-pulse transition-colors duration-200 whitespace-nowrap">
            Search →
          </button>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div>
          <div className="font-mono text-sm text-ink/40 mb-6">Searching...</div>
          <div className="news-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-ink/5 animate-pulse rounded" />
            ))}
          </div>
        </div>
      )}

      {!loading && searched && articles.length > 0 && (
        <div>
          <p className="font-mono text-sm text-ink/40 mb-6 uppercase tracking-widest">
            {articles.length} result{articles.length !== 1 ? 's' : ''} for "{query}"
          </p>
          <div className="news-grid stagger">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {!loading && searched && articles.length === 0 && (
        <div className="text-center py-24">
          <p className="font-display text-3xl text-ink/20 mb-3">No results found</p>
          <p className="font-mono text-sm text-ink/30">Try different keywords or browse by category</p>
        </div>
      )}

      {!loading && !searched && (
        <div className="text-center py-24">
          <p className="font-display text-3xl text-ink/20 mb-3">What are you looking for?</p>
          <p className="font-mono text-sm text-ink/30">Search across all saved articles</p>
        </div>
      )}

    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-16 bg-ink/5 animate-pulse mb-6" />
        <div className="news-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-ink/5 animate-pulse" />)}
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
