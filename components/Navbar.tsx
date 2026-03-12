'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { label: 'World',              href: '/category/world' },
  { label: 'Technology',         href: '/category/technology' },
  { label: 'Sports',             href: '/category/sports' },
  { label: 'Business',           href: '/category/business' },
  { label: '✨ Positive',        href: '/category/positive' },
  { label: '💥 Conflicts',       href: '/category/conflicts', highlight: true },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setSearchQuery('')
    setMenuOpen(false)
  }

  return (
    <header className="bg-ink text-cream sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top row: Logo + Nav */}
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-pulse font-mono font-bold text-lg">●</span>
            <span className="font-display text-2xl font-bold tracking-tight">GlobalPulse</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5">
            {CATEGORIES.map(cat => (
              <Link key={cat.href} href={cat.href}
                className={`font-mono text-xs uppercase tracking-widest transition-colors duration-200 ${
                  cat.highlight
                    ? 'text-pulse hover:text-red-400 font-bold'
                    : 'text-cream/70 hover:text-gold'
                }`}>
                {cat.label}
              </Link>
            ))}
            <Link href="/bookmarks"
              className="font-mono text-xs uppercase tracking-widest text-cream/70 hover:text-gold transition-colors duration-200">
              ★ Saved
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-cream p-1" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="font-mono text-xl">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Search bar — always visible */}
        <div className="border-t border-cream/10 py-2">
          <form onSubmit={handleSearch} className="flex gap-0">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="flex-1 px-4 py-2 bg-cream/10 text-cream placeholder-cream/40 font-body text-sm focus:outline-none focus:bg-cream/20 transition-colors"
            />
            <button type="submit"
              className="px-6 py-2 bg-pulse text-cream font-mono text-xs uppercase tracking-widest hover:bg-pulse/80 transition-colors whitespace-nowrap">
              GO →
            </button>
          </form>
        </div>

        {/* Mobile Nav dropdown */}
        {menuOpen && (
          <div className="md:hidden py-2 border-t border-cream/10">
            {CATEGORIES.map(cat => (
              <Link key={cat.href} href={cat.href}
                className={`block py-3 font-mono text-sm uppercase tracking-widest border-b border-cream/5 transition-colors ${
                  cat.highlight ? 'text-pulse font-bold' : 'text-cream/70 hover:text-gold'
                }`}
                onClick={() => setMenuOpen(false)}>
                {cat.label}
              </Link>
            ))}
            <Link href="/bookmarks"
              className="block py-3 font-mono text-sm uppercase tracking-widest text-cream/70 hover:text-gold"
              onClick={() => setMenuOpen(false)}>
              ★ Saved
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
