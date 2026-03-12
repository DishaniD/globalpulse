import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type DbArticle = {
  id: string
  title: string
  original_title: string
  description: string
  content: string
  url: string
  image_url: string
  ai_image_url: string | null
  ai_summary: string | null
  ai_rewritten: string | null
  source: string
  category: string
  published_at: string
  created_at?: string
  keywords: string[]
}

export type DbBookmark = {
  id?: number
  article_id: string
  user_session: string
  created_at?: string
}
