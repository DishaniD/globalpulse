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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const result = await runSync()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
    breakdown: {
      standard: totalSaved - conflictArticles.length,
      conflicts_rss: conflictArticles.length,
    }
  }
}
