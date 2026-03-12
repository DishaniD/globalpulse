import { NextResponse } from 'next/server'
import { fetchConflictNews } from '@/lib/rssService'
import { saveArticles } from '@/lib/db'

export const maxDuration = 60

export async function GET() {
  try {
    const articles = await fetchConflictNews(40)

    if (articles.length === 0) {
      return NextResponse.json({ success: false, message: 'No articles fetched from RSS feeds' })
    }

    await saveArticles(articles)

    return NextResponse.json({
      success: true,
      saved: articles.length,
      sources: {
        Reuters: articles.filter(a => a.source === 'Reuters').length,
        'Al Jazeera': articles.filter(a => a.source === 'Al Jazeera').length,
        'BBC World': articles.filter(a => a.source === 'BBC World').length,
        'The Guardian': articles.filter(a => a.source === 'The Guardian').length,
      }
    })
  } catch (error: any) {
    console.error('RSS sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
