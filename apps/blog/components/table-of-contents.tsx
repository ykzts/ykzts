'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/extract-headings'

interface TableOfContentsProps {
  headings: Heading[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  // Track active heading using Intersection Observer
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find all visible headings
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.id)

        // Set the first visible heading as active, or keep current if none visible
        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0])
        }
      },
      {
        // Trigger when heading is in the top 20% of viewport
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0
      }
    )

    // Observe all heading elements
    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null)

    for (const element of headingElements) {
      observer.observe(element)
    }

    return () => {
      observer.disconnect()
    }
  }, [headings])

  // Smooth scroll to heading
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Close mobile accordion after clicking
      setIsOpen(false)
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <>
      {/* Mobile: Collapsible accordion */}
      <div className="mb-8 lg:hidden">
        <button
          aria-controls="toc-content"
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="font-semibold text-foreground text-sm">目次</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {isOpen && (
          <nav
            aria-label="目次"
            className="mt-2 rounded-lg border border-border bg-card p-4"
            id="toc-content"
          >
            <ol className="space-y-2">
              {headings.map((heading) => (
                <li
                  className={heading.level === 3 ? 'ml-4' : ''}
                  key={heading.id}
                >
                  <button
                    className={`block w-full text-left text-sm transition-colors hover:text-primary ${
                      activeId === heading.id
                        ? 'font-medium text-primary'
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => scrollToHeading(heading.id)}
                    type="button"
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      {/* Desktop: Fixed sidebar */}
      <aside
        aria-label="目次"
        className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto lg:block"
      >
        <nav>
          <p className="mb-4 font-semibold text-foreground text-sm">目次</p>
          <ol className="space-y-2 border-border border-l-2 pl-4">
            {headings.map((heading) => (
              <li
                className={heading.level === 3 ? 'ml-4' : ''}
                key={heading.id}
              >
                <button
                  className={`block text-left text-sm transition-colors hover:text-primary ${
                    activeId === heading.id
                      ? 'font-medium text-primary'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => scrollToHeading(heading.id)}
                  type="button"
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
    </>
  )
}
