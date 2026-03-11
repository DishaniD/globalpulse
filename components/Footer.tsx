import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-ink text-cream mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-pulse font-mono font-bold text-lg">●</span>
              <span className="font-display text-2xl font-bold">GlobalPulse</span>
            </div>
            <p className="text-cream/50 text-sm font-body leading-relaxed">
              World news covering world events, technology, sports, business, and positive stories from around the globe.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-gold mb-4">Categories</h3>
            <ul className="space-y-2">
              {['World', 'Technology', 'Sports', 'Business', 'Positive'].map(cat => (
                <li key={cat}>
                  <Link
                    href={`/category/${cat.toLowerCase()}`}
                    className="text-cream/50 hover:text-cream text-sm font-body transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-gold mb-4">About</h3>
            <p className="text-cream/50 text-sm font-body leading-relaxed">
              GlobalPulse brings you the latest news from trusted sources around the world, presented in a clear and engaging way.
            </p>
          </div>
        </div>

        <div className="border-t border-cream/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/30 text-xs font-mono text-center md:text-left">
            © {new Date().getFullYear()} GlobalPulse. News content sourced from third-party APIs.
          </p>
        </div>
      </div>
    </footer>
  )
}
