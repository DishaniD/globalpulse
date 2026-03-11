import { NextRequest, NextResponse } from 'next/server'
import { rewriteArticle, summarizeArticle, generateImagePrompt } from '@/lib/aiService'

export const maxDuration = 60 // Allow up to 60 seconds for OpenAI

export async function POST(request: NextRequest) {
  const { title, content, category } = await request.json()

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  try {
    const [rewritten, summary, imagePrompt] = await Promise.all([
      rewriteArticle(title, content),
      summarizeArticle(title, content),
      generateImagePrompt(title, category || 'general'),
    ])

    return NextResponse.json({ rewritten, summary, imagePrompt })
  } catch (error: any) {
    console.error('AI rewrite error:', error?.message || error)
    return NextResponse.json({ error: 'AI processing failed', detail: error?.message }, { status: 500 })
  }
}
