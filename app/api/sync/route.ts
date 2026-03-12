import { NextRequest, NextResponse } from 'next/server'
import { fetchNewsByCategory, fetchTopHeadlines, mapApiArticle } from '@/lib/newsApi'
import { saveArticles } from '@/lib/db'
import { Category } from '@/types'

export const maxDuration = 60

// This endpoint fetches fresh news and saves to Supabase
// Call it via a cron job or manually to sync news
export async function POST(request: NextRequest) {
  // Simple auth check using a secret key
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const categories: Category[] = ['world', 'technology', 'sports', 'business', 'positive']
    let totalSaved = 0

    // Fetch top headlines for world
    const headlines = await fetchTopHeadlines(10)
    const headlineArticles = headlines.map(a => mapApiArticle(a, 'world'))
    await saveArticles(headlineArticles)
    totalSaved += headlineArticles.length

    // Fetch each category
    for (const category of categories) {
      const raw = await fetchNewsByCategory(category, 12)
      const articles = raw.map(a => mapApiArticle(a, category))
      await saveArticles(articles)
      totalSaved += articles.length
    }

    return NextResponse.json({ success: true, saved: totalSaved })
  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - manually trigger sync from browser (dev only)
export async function GET() {
  try {
    const categories: Category[] = ['world', 'technology', 'sports', 'business', 'positive']
    let totalSaved = 0

    const headlines = await fetchTopHeadlines(10)
    const headlineArticles = headlines.map(a => mapApiArticle(a, 'world'))
    await saveArticles(headlineArticles)
    totalSaved += headlineArticles.length

    for (const category of categories) {
      const raw = await fetchNewsByCategory(category, 12)
      const articles = raw.map(a => mapApiArticle(a, category))
      await saveArticles(articles)
      totalSaved += articles.length
    }

    return NextResponse.json({ success: true, saved: totalSaved })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
