import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateNewsImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `Editorial news photography style, no text overlays: ${prompt}`,
    n: 1,
    size: '1792x1024',
    quality: 'standard',
  })

  const url = response.data?.[0]?.url
  if (!url) throw new Error('No image URL returned from DALL-E')
  return url
}
