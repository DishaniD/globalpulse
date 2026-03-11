import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import NewsTicker from '@/components/NewsTicker'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'GlobalPulse — World News',
  description: 'Stay informed with the latest news from around the world — covering world events, technology, sports, business, and positive stories.',
  keywords: 'news, world news, technology, sports, business, positive news',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-cream text-ink font-body antialiased">
        <Navbar />
        <NewsTicker />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
