import { Suspense } from 'react'
import { Metadata } from 'next'
import ArticlePageClient from './client'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

// This runs on the server — generates OG meta tags for Facebook/Twitter sharing
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams
  const title = sp.title ? decodeURIComponent(sp.title) : 'GlobalPulse Article'
  const desc = sp.desc ? decodeURIComponent(sp.desc) : 'Read the latest news on GlobalPulse'
  const img = sp.img ? decodeURIComponent(sp.img) : 'https://globalpulse-two.vercel.app/og-default.png'
  const source = sp.source ? decodeURIComponent(sp.source) : 'GlobalPulse'
  const { id } = await params
  const pageUrl = `https://globalpulse-two.vercel.app/article/${id}?${new URLSearchParams(sp as Record<string, string>).toString()}`

  return {
    title: `${title} — GlobalPulse`,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      url: pageUrl,
      siteName: 'GlobalPulse',
      images: [
        {
          url: img,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'article',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: desc,
      images: [img],
      site: '@GlobalPulse',
    },
  }
}

export default function ArticlePage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 bg-ink/10 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-ink/10 rounded animate-pulse w-full" />
        <div className="h-64 bg-ink/10 rounded animate-pulse w-full" />
      </div>
    }>
      <ArticlePageClient />
    </Suspense>
  )
}
