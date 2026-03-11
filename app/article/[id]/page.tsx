'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import NewsImage from '@/components/NewsImage'

interface AIContent {
  rewritten: string
  summary: string
  imagePrompt: string
  aiImageUrl?: string
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

  const [status, setStatus] = useState<Status>('loading')
  const [aiContent, setAiContent] = useState<AIContent | null>(null)
  const [aiImgLoading, setAiImgLoading] = useState(false)

  useEffect(() => {
    if (!title) return

    async function processArticle() {
      try {
        setStatus('loading')

        const rewriteRes = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: desc || title, category: cat }),
        })

        if (!rewriteRes.ok) {
          const errData = await rewriteRes.json().catch(() => ({}))
          console.error('Rewrite API error:', errData)
          throw new Error(errData.detail || 'Rewrite failed')
        }

        const { rewritten, summary, imagePrompt } = await rewriteRes.json()
        setAiContent({ rewritten, summary, imagePrompt })
        setStatus('done')

        // Generate AI image in background
        if (imagePrompt) {
          setAiImgLoading(true)
          try {
            const imgRes = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: imagePrompt }),
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
  }, [title, desc, cat])

  // Use AI image if available, otherwise original
  const displayImage = aiContent?.aiImageUrl || img

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      {/* Back nav */}
      <Link href="/" className="inline-flex items-center gap-2 font-mono text-sm text-ink/40 hover:text-pulse transition-colors mb-6">
        ← Back
      </Link>

      {/* Category + Source + Date */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="category-badge">{cat}</span>
        <span className="font-mono text-xs text-ink/50 uppercase tracking-wider">{source}</span>
        {date && (
          <span className="font-mono text-xs text-ink/30">
            · {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-6">
        {title}
      </h1>

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
          <NewsImage
            src={displayImage}
            alt={title}
            category={cat}
            className="w-full max-h-[420px] min-h-[260px]"
          />
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

      {/* Read Original */}
      <div className="mt-10 pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-1">Source</p>
          <p className="font-body text-ink/60 text-sm">{source}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-ink text-cream font-mono text-sm px-5 py-3 hover:bg-pulse transition-colors duration-200 w-full sm:w-auto justify-center"
        >
          Read Original →
        </a>
      </div>

    </div>
  )
}
