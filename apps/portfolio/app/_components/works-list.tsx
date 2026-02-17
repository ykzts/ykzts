'use client'

import { useState } from 'react'
import type { PortableTextValue } from '@/lib/portable-text'
import PortableTextBlock from './portable-text'

type Work = {
  content: PortableTextValue | null
  slug: string
  title: string
  starts_at: string
}

type WorksListProps = {
  works: Work[]
  initialDisplayCount?: number
}

export default function WorksList({
  works,
  initialDisplayCount = 5
}: WorksListProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedWorks = showAll ? works : works.slice(0, initialDisplayCount)
  const hasMore = works.length > initialDisplayCount

  return (
    <>
      <div className="space-y-8">
        {displayedWorks.map((work) => (
          <article
            className="group rounded-xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md"
            id={work.slug}
            key={work.slug}
          >
            <h3 className="mb-4 font-semibold text-2xl text-card-foreground">
              {work.title}
            </h3>
            {work.content && (
              <div className="prose prose-base max-w-none prose-a:text-primary prose-p:text-base prose-p:text-muted-foreground prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
                <PortableTextBlock value={work.content} />
              </div>
            )}
          </article>
        ))}
      </div>
      {hasMore && !showAll && (
        <div className="mt-8 text-center">
          <button
            aria-label="もっと見る"
            className="rounded-lg border border-border bg-card px-6 py-3 font-medium text-card-foreground transition-all duration-300 hover:border-primary/50 hover:shadow-md"
            onClick={() => setShowAll(true)}
            type="button"
          >
            もっと見る
          </button>
        </div>
      )}
    </>
  )
}
