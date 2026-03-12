import { NextRequest, NextResponse } from 'next/server'
import { searchArticles } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const limit = parseInt(searchParams.get('limit') || '12')

  if (!query.trim()) {
    return NextResponse.json({ articles: [] })
  }

  try {
    const articles = await searchArticles(query, limit)
    return NextResponse.json({ articles })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
