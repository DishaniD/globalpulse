# 🌍 GlobalPulse — AI-Powered News Website

A modern news website that fetches latest news and rewrites/summarizes it using AI.

## Features
- 📰 Live news from TheNewsAPI (World, Tech, Sports, Business, Positive)
- 🤖 AI article rewriting via Claude (Anthropic)
- 📝 AI summaries for quick reading
- 🖼️ AI image generation via DALL-E 3
- ⚡ Built with Next.js 14, TypeScript, Tailwind CSS

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your API keys:
- `THE_NEWS_API_KEY` → https://www.thenewsapi.com/ (free tier: 150 req/day)
- `ANTHROPIC_API_KEY` → https://console.anthropic.com/
- `OPENAI_API_KEY` → https://platform.openai.com/

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
```
app/
  page.tsx              # Home page
  layout.tsx            # Root layout
  globals.css           # Global styles
  api/
    news/route.ts       # Fetch news API
    rewrite/route.ts    # AI rewrite API
    generate-image/     # DALL-E image API
  category/[slug]/      # Category pages
components/
  Navbar.tsx
  NewsTicker.tsx
  HeroSection.tsx
  CategorySection.tsx
  ArticleCard.tsx
  PositiveSection.tsx
  Footer.tsx
lib/
  newsApi.ts            # TheNewsAPI integration
  aiService.ts          # Claude AI integration
  imageService.ts       # DALL-E integration
types/
  index.ts              # TypeScript types
```
