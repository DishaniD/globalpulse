'use client'

const HEADLINES = [
  'GlobalPulse — AI-Powered World News',
  'Latest from Technology, Sports, Business & More',
  'News Rewritten & Summarized by AI for Clarity',
  'Positive Stories from Around the World',
  'Stay Informed. Stay Inspired.',
]

export default function NewsTicker() {
  return (
    <div className="bg-pulse text-white py-2 overflow-hidden">
      <div className="ticker-wrap">
        <div className="ticker-content font-mono text-sm tracking-wide">
          {HEADLINES.map((h, i) => (
            <span key={i} className="mx-12">
              <span className="text-gold mr-3">◆</span>{h}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {HEADLINES.map((h, i) => (
            <span key={`dup-${i}`} className="mx-12">
              <span className="text-gold mr-3">◆</span>{h}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
