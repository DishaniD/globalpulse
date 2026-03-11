export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { generateNewsImage } from '@/lib/imageService'

export async function POST(request: NextRequest) {
  const { prompt } = await request.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

  try {
    const imageUrl = await generateNewsImage(prompt)
    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('Image generation error:', error?.message || error)
    return NextResponse.json({ error: 'Image generation failed', detail: error?.message }, { status: 500 })
  }
}
