import { NextRequest, NextResponse } from 'next/server'
import { addBookmark, removeBookmark, getBookmarks, isBookmarked } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const session = searchParams.get('session') || ''
  const articleId = searchParams.get('articleId')

  if (!session) return NextResponse.json({ error: 'Session required' }, { status: 400 })

  // Check single bookmark status
  if (articleId) {
    const bookmarked = await isBookmarked(articleId, session)
    return NextResponse.json({ bookmarked })
  }

  // Get all bookmarks
  const bookmarks = await getBookmarks(session)
  return NextResponse.json({ bookmarks })
}

export async function POST(request: NextRequest) {
  const { articleId, session } = await request.json()
  if (!articleId || !session) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const success = await addBookmark(articleId, session)
  return NextResponse.json({ success })
}

export async function DELETE(request: NextRequest) {
  const { articleId, session } = await request.json()
  if (!articleId || !session) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const success = await removeBookmark(articleId, session)
  return NextResponse.json({ success })
}
