export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { generateNewsImage } from '@/lib/imageService'
import { updateArticleAI, getArticleById } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { prompt, articleId } = await request.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

  // Check if AI image already exists in DB
  if (articleId) {
    const existing = await getArticleById(articleId)
    if (existing?.ai_image_url) {
      return NextResponse.json({ imageUrl: existing.ai_image_url, fromCache: true })
    }
  }

  try {
    const imageUrl = await generateNewsImage(prompt)

    // Save to DB in background
    if (articleId && imageUrl) {
      updateArticleAI(articleId, '', '', imageUrl).catch(console.error)
    }

    return NextResponse.json({ imageUrl, fromCache: false })
  } catch (error: any) {
    console.error('Image generation error:', error?.message || error)
    return NextResponse.json({ error: 'Image generation failed', detail: error?.message }, { status: 500 })
  }
}
