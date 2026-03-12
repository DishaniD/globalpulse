import { supabase, DbArticle } from './supabase'
import { Article, Category } from '@/types'

// Convert our Article type to DB format
function toDbArticle(article: Article): DbArticle {
  return {
    id: article.id,
    title: article.title,
    original_title: article.original_title,
    description: article.description,
    content: article.content,
    url: article.url,
    image_url: article.image_url,
    ai_image_url: article.ai_image_url || null,
    ai_summary: article.ai_summary || null,
    ai_rewritten: article.ai_rewritten || null,
    source: article.source,
    category: article.category,
    published_at: article.published_at,
    keywords: article.keywords || [],
  }
}

// Convert DB format back to Article type
function fromDbArticle(db: DbArticle): Article {
  return {
    id: db.id,
    title: db.title,
    original_title: db.original_title,
    description: db.description,
    content: db.content,
    url: db.url,
    image_url: db.image_url,
    ai_image_url: db.ai_image_url || undefined,
    ai_summary: db.ai_summary || '',
    ai_rewritten: db.ai_rewritten || '',
    source: db.source,
    category: db.category,
    published_at: db.published_at,
    keywords: db.keywords || [],
  }
}

// Save articles to DB (upsert - update if exists)
export async function saveArticles(articles: Article[]): Promise<void> {
  const dbArticles = articles.map(toDbArticle)
  const { error } = await supabase
    .from('articles')
    .upsert(dbArticles, { onConflict: 'id' })

  if (error) console.error('Error saving articles:', error)
}

// Get articles by category from DB
export async function getArticlesByCategory(category: Category, limit = 9): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('category', category)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }
  return (data as DbArticle[]).map(fromDbArticle)
}

// Get all recent articles for homepage
export async function getTopHeadlines(limit = 6): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching headlines:', error)
    return []
  }
  return (data as DbArticle[]).map(fromDbArticle)
}

// Get single article by ID
export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return fromDbArticle(data as DbArticle)
}

// Update article with AI content
export async function updateArticleAI(
  id: string,
  aiSummary: string,
  aiRewritten: string,
  aiImageUrl?: string
): Promise<void> {
  const updates: Partial<DbArticle> = {
    ai_summary: aiSummary,
    ai_rewritten: aiRewritten,
  }
  if (aiImageUrl) updates.ai_image_url = aiImageUrl

  const { error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)

  if (error) console.error('Error updating AI content:', error)
}

// Search articles
export async function searchArticles(query: string, limit = 12): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error searching articles:', error)
    return []
  }
  return (data as DbArticle[]).map(fromDbArticle)
}

// ── BOOKMARKS ──

export async function addBookmark(articleId: string, userSession: string): Promise<boolean> {
  const { error } = await supabase
    .from('bookmarks')
    .insert({ article_id: articleId, user_session: userSession })

  return !error
}

export async function removeBookmark(articleId: string, userSession: string): Promise<boolean> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('article_id', articleId)
    .eq('user_session', userSession)

  return !error
}

export async function getBookmarks(userSession: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('article_id, articles(*)')
    .eq('user_session', userSession)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error)
    return []
  }

  return data
    .map((b: any) => b.articles)
    .filter(Boolean)
    .map(fromDbArticle)
}

export async function isBookmarked(articleId: string, userSession: string): Promise<boolean> {
  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('article_id', articleId)
    .eq('user_session', userSession)
    .single()

  return !!data
}
