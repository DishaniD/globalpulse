import { Article } from '@/types'

// ── RSS FEEDS ─────────────────────────────────────────────────────────────────
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

// ── SIMPLE HASH (no crypto dependency) ───────────────────────────────────────
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36).padStart(8, '0')
}

// ── HTML ENTITY DECODER ───────────────────────────────────────────────────────
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
}

// ── CLEAN DESCRIPTION ─────────────────────────────────────────────────────────
function cleanDescription(raw: string): string {
  let text = decodeHtmlEntities(raw)
  text = text.replace(/<[^>]+>/g, ' ')
  text = text.replace(/\s+/g, ' ').trim()
  return text.slice(0, 500)
}

// ── FETCH OG IMAGE FROM ARTICLE PAGE ─────────────────────────────────────────
async function fetchOgImage(url: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GlobalPulse/1.0)',
        'Accept': 'text/html',
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) return ''

    // Only read first 10KB — og:image is always in <head>
    const reader = res.body?.getReader()
    if (!reader) return ''

    let html = ''
    let bytesRead = 0
    while (bytesRead < 10000) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
      bytesRead += value?.length || 0
    }
    reader.cancel()

    // Extract og:image
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      || html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)

    const imgUrl = ogMatch ? ogMatch[1] : ''

    // Validate it looks like a real image
    if (imgUrl && imgUrl.startsWith('http') && !imgUrl.includes('logo') && !imgUrl.includes('favicon')) {
      return imgUrl
    }

    return ''
  } catch {
    return ''
  }
}

// ── XML PARSER ────────────────────────────────────────────────────────────────
function extractTag(xml: string, tag: string): string {
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
  if (cdataMatch) return cdataMatch[1].trim()
  const plainMatch = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  if (plainMatch) return plainMatch[1].replace(/<[^>]+>/g, '').trim()
  return ''
}

function extractAttribute(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : ''
}

function extractImageFromItem(itemXml: string): string {
  let img = extractAttribute(itemXml, 'media:content', 'url')
  if (img) return img
  img = extractAttribute(itemXml, 'media:thumbnail', 'url')
  if (img) return img
  img = extractAttribute(itemXml, 'enclosure', 'url')
  if (img && /\.(jpg|jpeg|png|webp)/i.test(img)) return img
  const ogMatch = itemXml.match(/src=["']([^"']+\.(?:jpg|jpeg|png|webp))[^"']*["']/i)
  if (ogMatch) return ogMatch[1]
  return ''
}

function parseRssItems(xml: string, sourceName: string): Article[] {
  const articles: Article[] = []
  const itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []

  for (const item of itemMatches) {
    const title = extractTag(item, 'title')
    const link = extractTag(item, 'link') || extractAttribute(item, 'link', 'href')
    const rawDescription = extractTag(item, 'description') || extractTag(item, 'summary') || ''
    const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'published') || extractTag(item, 'dc:date')
    const image = extractImageFromItem(item)

    if (!title || !link) continue

    const cleanDesc = cleanDescription(rawDescription)
    const id = 'rss_' + simpleHash(link) + '_' + simpleHash(title)

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
          'User-Agent': 'Mozilla/5.0 (compatible; GlobalPulse/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 900 },
      })

      if (!res.ok) continue
      const xml = await res.text()
      if (!xml.includes('<item') && !xml.includes('<entry')) continue

      const articles = parseRssItems(xml, feed.name)
      console.log(`✓ ${feed.name}: ${articles.length} articles`)
      return articles

    } catch (err) {
      console.warn(`✗ ${feed.name} (${url}) failed:`, err)
      continue
    }
  }

  console.error(`✗ ${feed.name}: all URLs failed`)
  return []
}

// ── ENRICH ARTICLES WITH OG IMAGES ───────────────────────────────────────────
// For articles missing images, fetch the OG image from the article page
async function enrichWithOgImages(articles: Article[]): Promise<Article[]> {
  const missing = articles.filter(a => !a.image_url)
  const withImage = articles.filter(a => !!a.image_url)

  console.log(`Fetching OG images for ${missing.length} articles without images...`)

  // Batch in groups of 5 to avoid overwhelming servers
  const enriched: Article[] = []
  for (let i = 0; i < missing.length; i += 5) {
    const batch = missing.slice(i, i + 5)
    const results = await Promise.allSettled(
      batch.map(async (article) => {
        const ogImage = await fetchOgImage(article.url)
        return { ...article, image_url: ogImage }
      })
    )
    for (const result of results) {
      if (result.status === 'fulfilled') {
        enriched.push(result.value)
      }
    }
  }

  const withOg = enriched.filter(a => !!a.image_url).length
  console.log(`OG image fetch: ${withOg}/${missing.length} found`)

  return [...withImage, ...enriched]
}

// ── FILTER BAD ARTICLES ───────────────────────────────────────────────────────
function isValidRssArticle(article: Article): boolean {
  if (!article.title || article.title.length < 10) return false
  if (!article.url || !article.url.startsWith('http')) return false
  if (!article.description || article.description.length < 20) return false

  const img = article.image_url || ''
  if (img.includes('favicon') || img.includes('.ico') || img.includes('icon')) {
    article.image_url = ''
  }

  try {
    const age = Date.now() - new Date(article.published_at).getTime()
    if (age > 7 * 24 * 60 * 60 * 1000) return false
  } catch {
    return false
  }

  return true
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export async function fetchConflictNews(limit = 24): Promise<Article[]> {
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

  // Take only what we need before OG fetching
  const topArticles = valid.slice(0, limit)

  // Enrich missing images with OG scraping
  const enriched = await enrichWithOgImages(topArticles)

  // Re-sort after enrichment
  enriched.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

  console.log(`RSS: ${allArticles.length} fetched → ${valid.length} valid → ${enriched.filter(a => a.image_url).length} with images`)
  return enriched
}
