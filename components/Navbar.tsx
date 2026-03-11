'use client'
import Link from 'next/link'
import { useState } from 'react'

const CATEGORIES = [
  { label: 'World', href: '/category/world' },
  { label: 'Technology', href: '/category/technology' },
  { label: 'Sports', href: '/category/sports' },
  { label: 'Business', href: '/category/business' },
  { label: '✨ Positive', href: '/category/positive' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-ink text-cream sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-pulse font-mono font-bold text-lg">●</span>
            <span className="font-display text-2xl font-bold tracking-tight">GlobalPulse</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.href}
                href={cat.href}
                className="font-mono text-sm uppercase tracking-widest text-cream/70 hover:text-gold transition-colors duration-200"
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu */}
          <button
            className="md:hidden text-cream p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="font-mono text-xl">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-cream/10">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.href}
                href={cat.href}
                className="block py-3 font-mono text-sm uppercase tracking-widest text-cream/70 hover:text-gold border-b border-cream/5"
                onClick={() => setMenuOpen(false)}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
