'use client'
import { useState } from 'react'

interface NewsImageProps {
  src: string
  alt: string
  className?: string
  category?: string
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  world: 'from-blue-900 to-blue-700',
  technology: 'from-violet-900 to-violet-700',
  sports: 'from-green-900 to-green-700',
  business: 'from-amber-900 to-amber-700',
  positive: 'from-emerald-900 to-emerald-700',
  conflicts: 'from-red-950 to-red-800',
  general: 'from-slate-800 to-slate-600',
}

const CATEGORY_ICONS: Record<string, string> = {
  world: '🌍',
  technology: '💻',
  sports: '⚽',
  business: '📈',
  positive: '🌟',
  conflicts: '⚡',
  general: '📰',
}

const LOGO_DOMAINS = [
  'sportsnet.ca/wp-content/uploads/2013',
  'sportsnet.ca/wp-content/uploads/2014',
  'cdn.sportsnet.ca/wp-content/themes',
  'logo',
  'icon',
  'avatar',
  'favicon',
  'placeholder',
]

function isLikelyLogo(url: string): boolean {
  if (!url) return true
  const lower = url.toLowerCase()
  return LOGO_DOMAINS.some(domain => lower.includes(domain))
}

export default function NewsImage({ src, alt, className = '', category = 'general' }: NewsImageProps) {
  const [showFallback, setShowFallback] = useState(isLikelyLogo(src))
  const [loaded, setLoaded] = useState(false)

  const gradient = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.general
  const icon = CATEGORY_ICONS[category] || '📰'

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    if (img.naturalWidth < 200 || img.naturalHeight < 120) {
      setShowFallback(true)
    } else {
      setLoaded(true)
    }
  }

  if (showFallback || !src) {
    return (
      <div className={`bg-gradient-to-br ${gradient} flex flex-col items-center justify-center ${className}`}>
        <span className="text-5xl mb-2">{icon}</span>
        <span className="font-sans text-white/20 text-xs font-bold uppercase tracking-widest">GlobalPulse</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-4xl animate-pulse">{icon}</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleLoad}
        onError={() => setShowFallback(true)}
      />
    </div>
  )
}
