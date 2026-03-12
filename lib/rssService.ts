import { Article } from '@/types'
import crypto from 'crypto'

// ── RSS FEEDS ─────────────────────────────────────────────────────────────────
// 4 sources: Reuters, Al Jazeera, BBC World, The Guardian World
// All broad world/conflict news — no keyword filtering, maximum coverage

const RSS_FEEDS = [
  {
    name: 'Reuters',
    url: 'https://feeds.reuters.com/reuters/worldNews',
    fallback: 'https://rss.reuters.com/reuters/worldNews',
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    fallback: 'https://www.aljazeera.com/rss/all.xml',
  },
  {
    name: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    fallback: 'https://news.bbc.co.uk/rss/newsonline_world_edition/front_page/rss.xml',
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    fallback: 'https://www.theguardian.com/international/rss',
  },
]

// ── XML PARSER ────────────────────────────────────────────────────────────────
// Simple regex-based XML parser — no dependencies needed

function extractTag(xml: string, tag: string): string {
  // Try CDATA first
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
  if (cdataMatch) return cdataMatch[1].trim()

  // Then plain content
  const plainMatch = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  if (plainMatch) return plainMatch[1].replace(/<[^>]+>/g, '').trim()

  return ''
}

function extractAllTags(xml: string, tag: string): string[] {
  const results: string[] = []
  const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi')
  const matches = xml.match(regex) || []
  for (const match of matches) {
    const content = extractTag(match, tag)
    if (content) results.push(content)
  }
  return results
}

function extractAttribute(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : ''
}

function extractImageFromItem(itemXml: string): string {
  // Try media:content
  let img = extractAttribute(itemXml, 'media:content', 'url')
  if (img) return img

  // Try media:thumbnail
  img = extractAttribute(itemXml, 'media:thumbnail', 'url')
  if (img) return img

  // Try enclosure
  img = extractAttribute(itemXml, 'enclosure', 'url')
  if (img && (img.includes('.jpg') || img.includes('.jpeg') || img.includes('.png') || img.includes('.webp'))) return img

  // Try og:image in description HTML
  const ogMatch = itemXml.match(/src=["']([^"']+\.(?:jpg|jpeg|png|webp))[^"']*["']/i)
  if (ogMatch) return ogMatch[1]

  return ''
}

function parseRssItems(xml: string, sourceName: string): Article[] {
  const articles: Article[] = []

  // Split into individual <item> blocks
  const itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []

  for (const item of itemMatches) {
    const title = extractTag(item, 'title')
    const link = extractTag(item, 'link') || extractAttribute(item, 'link', 'href')
    const description = extractTag(item, 'description') || extractTag(item, 'summary')
    const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'published') || extractTag(item, 'dc:date')
    const image = extractImageFromItem(item)
    const guid = extractTag(item, 'guid') || link

    if (!title || !link) continue

    // Clean description — strip HTML tags
    const cleanDesc = description.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 500)

    // Generate stable ID from URL
    const id = 'rss_' + crypto.createHash('md5').update(link).digest('hex').slice(0, 16)

    // Parse date
    let publishedAt: string
    try {
      publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
    } catch {
      publishedAt = new Date().toISOString()
    }

    articles.push({
      id,
      title: title.slice(0, 300),
      original_title: title.slice(0, 300),
      description: cleanDesc,
      ai_summary: '',
      ai_rewritten: '',
      content: cleanDesc,
      url: link,
      image_url: image,
      published_at: publishedAt,
      source: sourceName,
      category: 'conflicts',
      keywords: [],
    })
  }

  return articles
}

// ── FETCH A SINGLE FEED ───────────────────────────────────────────────────────

async function fetchFeed(feed: typeof RSS_FEEDS[0]): Promise<Article[]> {
  const urls = [feed.url, feed.fallback]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GlobalPulse/1.0; +https://globalpulse-two.vercel.app)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(10000), // 10s timeout per feed
        next: { revalidate: 900 }, // Cache for 15 minutes
      })

      if (!res.ok) continue

      const xml = await res.text()
      if (!xml.includes('<item') && !xml.includes('<entry')) continue

      const articles = parseRssItems(xml, feed.name)
      console.log(`✓ ${feed.name}: fetched ${articles.length} articles`)
      return articles

    } catch (err) {
      console.warn(`✗ ${feed.name} (${url}): ${err}`)
      continue
    }
  }

  console.error(`✗ ${feed.name}: all URLs failed`)
  return []
}

// ── FILTER BAD ARTICLES ───────────────────────────────────────────────────────

function isValidRssArticle(article: Article): boolean {
  if (!article.title || article.title.length < 10) return false
  if (!article.url || !article.url.startsWith('http')) return false
  if (!article.description || article.description.length < 20) return false

  // Filter favicon/icon images
  const img = article.image_url || ''
  if (img.includes('favicon') || img.includes('.ico') || img.includes('icon')) {
    article.image_url = ''
  }

  // Filter articles older than 7 days
  try {
    const age = Date.now() - new Date(article.published_at).getTime()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (age > sevenDays) return false
  } catch {
    return false
  }

  return true
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export async function fetchConflictNews(limit = 24): Promise<Article[]> {
  // Fetch all 4 feeds in parallel
  const results = await Promise.allSettled(RSS_FEEDS.map(feed => fetchFeed(feed)))

  const allArticles: Article[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value)
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  const unique = allArticles.filter(a => {
    if (seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })

  // Filter bad articles
  const valid = unique.filter(isValidRssArticle)

  // Sort by newest first
  valid.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

  console.log(`RSS total: ${allArticles.length} fetched → ${valid.length} valid → returning ${Math.min(valid.length, limit)}`)

  return valid.slice(0, limit)
}
