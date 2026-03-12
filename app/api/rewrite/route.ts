export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { rewriteArticle, summarizeArticle, generateImagePrompt } from '@/lib/aiService'
import { updateArticleAI, getArticleById } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { title, content, category, articleId } = await request.json()

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  // Check if article already has AI content saved in DB
  if (articleId) {
    const existing = await getArticleById(articleId)
    if (existing?.ai_rewritten && existing?.ai_summary) {
      return NextResponse.json({
        rewritten: existing.ai_rewritten,
        summary: existing.ai_summary,
        imagePrompt: '',
        aiImageUrl: existing.ai_image_url || '',
        fromCache: true,
      })
    }
  }

  try {
    const [rewritten, summary, imagePrompt] = await Promise.all([
      rewriteArticle(title, content),
      summarizeArticle(title, content),
      generateImagePrompt(title, category || 'general'),
    ])

    // Save to DB in background
    if (articleId) {
      updateArticleAI(articleId, summary, rewritten).catch(console.error)
    }

    return NextResponse.json({ rewritten, summary, imagePrompt, fromCache: false })
  } catch (error: any) {
    console.error('AI rewrite error:', error?.message || error)
    return NextResponse.json({ error: 'AI processing failed', detail: error?.message }, { status: 500 })
  }
}
