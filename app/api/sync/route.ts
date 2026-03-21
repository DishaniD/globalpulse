import { NextRequest, NextResponse } from 'next/server'
import { fetchNewsByCategory, fetchTopHeadlines, mapApiArticle } from '@/lib/newsApi'
import { fetchConflictNews } from '@/lib/rssService'
import { saveArticles } from '@/lib/db'
import { Category } from '@/types'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await runSync()
    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Allow Vercel cron jobs (they send this header) OR manual calls with secret
  const isCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  const isManual = authHeader === `Bearer ${process.env.SYNC_SECRET}`

  if (!isCron && !isManual && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runSync()
    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function runSync() {
  const categories: Category[] = ['world', 'technology', 'sports', 'business', 'positive']
  let totalSaved = 0

  // 1. Fetch top headlines
  const headlines = await fetchTopHeadlines(10)
  const headlineArticles = headlines.map(a => mapApiArticle(a, 'world'))
  await saveArticles(headlineArticles)
  totalSaved += headlineArticles.length

  // 2. Fetch each standard category from TheNewsAPI
  for (const category of categories) {
    const raw = await fetchNewsByCategory(category, 12)
    const articles = raw.map(a => mapApiArticle(a, category))
    await saveArticles(articles)
    totalSaved += articles.length
  }

  // 3. Fetch conflict/war news from RSS feeds
  const conflictArticles = await fetchConflictNews(40)
  await saveArticles(conflictArticles)
  totalSaved += conflictArticles.length

  return {
    success: true,
    saved: totalSaved,
    synced_at: new Date().toISOString(),
    breakdown: {
      standard: totalSaved - conflictArticles.length,
      conflicts_rss: conflictArticles.length,
    }
  }
}
