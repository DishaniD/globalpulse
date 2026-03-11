import { NextRequest, NextResponse } from 'next/server'
import { fetchNewsByCategory, fetchTopHeadlines, mapApiArticle } from '@/lib/newsApi'
import { Category } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = (searchParams.get('category') || 'general') as Category
  const limit = parseInt(searchParams.get('limit') || '9')

  try {
    const articles = category === 'general'
      ? await fetchTopHeadlines(limit)
      : await fetchNewsByCategory(category, limit)

    const mapped = articles.map(a => mapApiArticle(a, category))
    return NextResponse.json({ articles: mapped })
  } catch (error) {
    console.error('News fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
