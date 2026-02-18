'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import PostCard from '@/components/post-card'

type Post = {
  content: unknown
  excerpt: string | null
  id: string
  profile: {
    id: string
    name: string
  } | null
  published_at: string
  slug: string
  tags: string[] | null
  title: string
  version_date: string | null
}

type YearData = {
  count: number
  posts: Post[]
  year: number
}

type ArchiveListProps = {
  initialYearData: YearData
}

export default function ArchiveList({ initialYearData }: ArchiveListProps) {
  const [yearDataList, setYearDataList] = useState<YearData[]>([
    initialYearData
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)
  const currentYearRef = useRef(initialYearData.year)

  const loadNextYear = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    const nextYear = currentYearRef.current - 1

    try {
      const response = await fetch(`/blog/archive/api?year=${nextYear}`)
      if (!response.ok) {
        setHasMore(false)
        return
      }

      const data: YearData = await response.json()

      if (!data.posts || data.posts.length === 0) {
        setHasMore(false)
        return
      }

      currentYearRef.current = nextYear
      setYearDataList((prev) => [...prev, data])
    } catch (error) {
      console.error('Failed to load year data:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadNextYear()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, isLoading, loadNextYear])

  return (
    <div className="space-y-12">
      {yearDataList.map((yearData) => (
        <section key={yearData.year}>
          <h2 className="mb-6 font-bold text-2xl">
            {yearData.year}年 ({yearData.count}件)
          </h2>
          <div className="space-y-6">
            {yearData.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ))}

      {hasMore && (
        <div className="py-8 text-center" ref={observerTarget}>
          {isLoading ? (
            <p className="text-muted-foreground">読み込み中...</p>
          ) : (
            <p className="text-muted-foreground">スクロールで続きを読み込み</p>
          )}
        </div>
      )}

      {!hasMore && yearDataList.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">すべての記事を表示しました</p>
        </div>
      )}
    </div>
  )
}
