'use client'
import { Suspense } from 'react'

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-ink/10 rounded w-24" />
          <div className="h-8 bg-ink/10 rounded w-3/4" />
          <div className="h-64 bg-ink/10 rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-ink/10 rounded" />
            <div className="h-4 bg-ink/10 rounded w-5/6" />
            <div className="h-4 bg-ink/10 rounded w-4/6" />
          </div>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  )
}
