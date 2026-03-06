'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { PortableTextValue } from '@/lib/portable-text'
import PortableTextBlock from './portable-text'

type WorkUrl = {
  id: string
  label: string
  sort_order: number
  url: string
}

type WorkTechnology = {
  technology: { name: string } | null
  technology_id: string
}

type Work = {
  content: PortableTextValue | null
  slug: string
  starts_at: string
  title: string
  work_technologies: WorkTechnology[]
  work_urls: WorkUrl[]
}

type WorksListProps = {
  works: Work[]
  initialDisplayCount?: number
}

export default function WorksList({
  works,
  initialDisplayCount = 5
}: WorksListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTechnology = searchParams.get('technology')

  const [showAll, setShowAll] = useState(false)

  const allTechnologies = useMemo(
    () =>
      Array.from(
        new Set(
          works.flatMap((work) =>
            work.work_technologies
              .map((wt) => wt.technology?.name)
              .filter((name): name is string => name !== undefined)
          )
        )
      ).sort(),
    [works]
  )

  const filteredWorks = activeTechnology
    ? works.filter((work) =>
        work.work_technologies.some(
          (wt) => wt.technology?.name === activeTechnology
        )
      )
    : works

  const displayedWorks = showAll
    ? filteredWorks
    : filteredWorks.slice(0, initialDisplayCount)
  const hasMore = filteredWorks.length > initialDisplayCount

  const handleTechnologyFilter = (technology: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (technology) {
      params.set('technology', technology)
    } else {
      params.delete('technology')
    }
    setShowAll(false)
    const query = params.toString()
    router.push(query ? `/?${query}` : '/', { scroll: false })
  }

  return (
    <>
      {allTechnologies.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !activeTechnology
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-card-foreground hover:border-primary/50'
            }`}
            onClick={() => handleTechnologyFilter(null)}
            type="button"
          >
            すべて
          </button>
          {allTechnologies.map((tech) => (
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTechnology === tech
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-card-foreground hover:border-primary/50'
              }`}
              key={tech}
              onClick={() => handleTechnologyFilter(tech)}
              type="button"
            >
              {tech}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-8">
        {displayedWorks.map((work) => {
          const validTechnologies = work.work_technologies.filter(
            (wt) => wt.technology !== null
          )

          return (
            <article
              className="group rounded-xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md"
              id={work.slug}
              key={work.slug}
            >
              <h3 className="mb-4 font-semibold text-2xl text-card-foreground">
                {work.title}
              </h3>
              {work.content && (
                <div className="prose prose-theme prose-base max-w-none prose-p:text-base prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
                  <PortableTextBlock value={work.content} />
                </div>
              )}
              {work.work_urls.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {work.work_urls.map((workUrl) => (
                    <a
                      className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-card-foreground transition-colors hover:border-primary/50 hover:text-primary"
                      href={workUrl.url}
                      key={workUrl.id}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {workUrl.label}
                    </a>
                  ))}
                </div>
              )}
              {validTechnologies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {validTechnologies.map((wt) => (
                    <span
                      className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                      key={wt.technology_id}
                    >
                      {wt.technology?.name}
                    </span>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
      {hasMore && !showAll && (
        <div className="mt-8 text-center">
          <button
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
