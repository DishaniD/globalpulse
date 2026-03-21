import { NextRequest, NextResponse } from 'next/server'
import { fetchConflictNews } from '@/lib/rssService'
import { saveArticles } from '@/lib/db'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  // Allow Vercel cron jobs or manual calls with secret
  const isCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  const isManual = authHeader === `Bearer ${process.env.SYNC_SECRET}`

  if (!isCron && !isManual && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const articles = await fetchConflictNews(40)

    if (articles.length === 0) {
      return NextResponse.json({ success: false, message: 'No articles fetched from RSS feeds' })
    }

    await saveArticles(articles)

    const withImages = articles.filter(a => a.image_url).length

    return NextResponse.json({
      success: true,
      saved: articles.length,
      synced_at: new Date().toISOString(),
      with_images: withImages,
      without_images: articles.length - withImages,
      sources: {
        Reuters: articles.filter(a => a.source === 'Reuters').length,
        'Al Jazeera': articles.filter(a => a.source === 'Al Jazeera').length,
        'BBC World': articles.filter(a => a.source === 'BBC World').length,
        'The Guardian': articles.filter(a => a.source === 'The Guardian').length,
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('RSS sync error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
