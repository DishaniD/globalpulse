import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function rewriteArticle(title: string, content: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 800,
    messages: [
      {
        role: 'system',
        content: 'You are a professional journalist at GlobalPulse, a modern AI-powered news website. Rewrite news articles in an engaging, clear, and informative way. Keep it factual but compelling. 2-3 paragraphs max. Write only the article body, no title or preamble.'
      },
      {
        role: 'user',
        content: `Rewrite this news article:\n\nTitle: ${title}\nContent: ${content}`
      }
    ]
  })

  return response.choices[0]?.message?.content || content
}

export async function summarizeArticle(title: string, content: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 150,
    messages: [
      {
        role: 'system',
        content: 'Summarize news articles in exactly 2 sentences. Be concise and factual. Write only the summary, nothing else.'
      },
      {
        role: 'user',
        content: `Summarize:\n\nTitle: ${title}\nContent: ${content}`
      }
    ]
  })

  return response.choices[0]?.message?.content || ''
}

export async function generateImagePrompt(title: string, category: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 100,
    messages: [
      {
        role: 'system',
        content: 'Create DALL-E image prompts for news articles. No text, no people\'s faces, photorealistic editorial photography style. Under 50 words. Respond with only the prompt.'
      },
      {
        role: 'user',
        content: `Category: ${category}\nArticle: ${title}`
      }
    ]
  })

  return response.choices[0]?.message?.content || `Editorial photo representing ${category} news`
}
