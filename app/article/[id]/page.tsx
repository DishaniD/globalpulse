'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import NewsImage from '@/components/NewsImage'
import ShareButtons from '@/components/ShareButtons'

interface AIContent {
  rewritten: string
  summary: string
  imagePrompt: string
  aiImageUrl?: string
  fromCache?: boolean
}

type Status = 'loading' | 'done' | 'error'

export default function ArticlePage() {
  const params = useSearchParams()

  const url = params.get('url') || ''
  const title = params.get('title') || ''
  const desc = params.get('desc') || ''
  const img = params.get('img') || ''
  const source = params.get('source') || ''
  const cat = params.get('cat') || 'general'
  const date = params.get('date') || ''
  const articleId = params.get('id') || ''

  const [status, setStatus] = useState<Status>('loading')
  const [aiContent, setAiContent] = useState<AIContent | null>(null)
  const [aiImgLoading, setAiImgLoading] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [session] = useState(() => {
    if (typeof window === 'undefined') return ''
    let s = localStorage.getItem('gp_session')
    if (!s) {
      s = Math.random().toString(36).slice(2)
      localStorage.setItem('gp_session', s)
    }
    return s
  })

  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

  useEffect(() => {
    if (!articleId || !session) return
    fetch(`/api/bookmarks?session=${session}&articleId=${articleId}`)
      .then(r => r.json())
      .then(d => setBookmarked(d.bookmarked))
      .catch(() => {})
  }, [articleId, session])

  useEffect(() => {
    if (!title) return

    async function processArticle() {
      try {
        setStatus('loading')
        const rewriteRes = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: desc || title, category: cat, articleId }),
        })
        if (!rewriteRes.ok) throw new Error('Rewrite failed')
        const { rewritten, summary, imagePrompt, aiImageUrl, fromCache } = await rewriteRes.json()
        setAiContent({ rewritten, summary, imagePrompt, aiImageUrl, fromCache })
        setStatus('done')

        if (aiImageUrl) return

        if (imagePrompt) {
          setAiImgLoading(true)
          try {
            const imgRes = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: imagePrompt, articleId }),
            })
            if (imgRes.ok) {
              const { imageUrl } = await imgRes.json()
              setAiContent(prev => prev ? { ...prev, aiImageUrl: imageUrl } : prev)
            }
          } catch (e) {
            console.error('Image gen failed:', e)
          } finally {
            setAiImgLoading(false)
          }
        }
      } catch (err) {
        console.error('Article processing error:', err)
        setStatus('error')
      }
    }

    processArticle()
  }, [title, desc, cat, articleId])

  async function toggleBookmark() {
    if (!articleId || !session) return
    const method = bookmarked ? 'DELETE' : 'POST'
    await fetch('/api/bookmarks', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, session }),
    })
    setBookmarked(!bookmarked)
  }

  const displayImage = aiContent?.aiImageUrl || img

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      <Link href="/" className="inline-flex items-center gap-2 font-mono text-sm text-ink/40 hover:text-pulse transition-colors mb-6">
        ← Back
      </Link>

      {/* Category + Source + Date + Bookmark */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="category-badge">{cat}</span>
        <span className="font-mono text-xs text-ink/50 uppercase tracking-wider">{source}</span>
        {date && (
          <span className="font-mono text-xs text-ink/30">
            · {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </span>
        )}
        <button onClick={toggleBookmark}
          className="ml-auto flex items-center gap-1 font-mono text-xs px-3 py-1 border transition-colors duration-200"
          style={{ borderColor: bookmarked ? '#C8102E' : '#ccc', color: bookmarked ? '#C8102E' : '#888' }}>
          {bookmarked ? '★ Saved' : '☆ Save'}
        </button>
      </div>

      {/* Title */}
      <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-6">
        {title}
      </h1>

      {/* Share Buttons */}
      <div className="mb-6 pb-6 border-b border-ink/10">
        <ShareButtons title={title} url={shareUrl || url} />
      </div>

      {/* Summary Box */}
      <div className="bg-ink text-cream p-5 mb-8 border-l-4 border-pulse">
        {status === 'loading' && (
          <div className="space-y-2">
            <div className="h-3 bg-cream/10 rounded animate-pulse w-full" />
            <div className="h-3 bg-cream/10 rounded animate-pulse w-4/5" />
            <div className="h-3 bg-cream/10 rounded animate-pulse w-3/5" />
          </div>
        )}
        {status === 'done' && aiContent && (
          <p className="text-cream/85 text-sm sm:text-base leading-relaxed font-body">{aiContent.summary}</p>
        )}
        {status === 'error' && (
          <p className="text-cream/60 text-sm font-body leading-relaxed">{desc}</p>
        )}
      </div>

      {/* Hero Image */}
      <div className="relative mb-8 overflow-hidden" style={{ minHeight: '260px' }}>
        {aiImgLoading ? (
          <div className="flex flex-col items-center justify-center bg-ink/5 h-64">
            <div className="w-7 h-7 border-2 border-pulse border-t-transparent rounded-full animate-spin mb-2" />
            <p className="font-mono text-xs text-ink/40">Loading image...</p>
          </div>
        ) : (
          <NewsImage src={displayImage} alt={title} category={cat}
            className="w-full max-h-[420px] min-h-[260px]" />
        )}
      </div>

      {/* Article Body */}
      <article>
        {status === 'loading' && (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`h-4 bg-ink/10 rounded animate-pulse ${i % 4 === 3 ? 'w-2/3' : 'w-full'}`} />
            ))}
          </div>
        )}
        {status === 'done' && aiContent && (
          <div className="font-body text-base sm:text-lg leading-relaxed text-ink/90 whitespace-pre-wrap">
            {aiContent.rewritten}
          </div>
        )}
        {status === 'error' && (
          <div className="font-body text-base sm:text-lg leading-relaxed text-ink/90">
            <p>{desc}</p>
          </div>
        )}
      </article>

      {/* Bottom Share + Read Original */}
      <div className="mt-10 pt-6 border-t border-ink/10 space-y-6">
        <ShareButtons title={title} url={shareUrl || url} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-1">Source</p>
            <p className="font-body text-ink/60 text-sm">{source}</p>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-ink text-cream font-mono text-sm px-5 py-3 hover:bg-pulse transition-colors duration-200 w-full sm:w-auto justify-center">
            Read Original →
          </a>
        </div>
      </div>

    </div>
  )
}
