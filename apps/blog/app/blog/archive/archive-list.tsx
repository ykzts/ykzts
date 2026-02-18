'use client'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@ykzts/ui/components/card'
import { Skeleton } from '@ykzts/ui/components/skeleton'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import PostCard from '@/components/post-card'
import type { PortableTextValue } from '@/lib/portable-text'
import { getYearData } from './actions'

type Post = {
  content: PortableTextValue | null
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
  const [isPending, startTransition] = useTransition()
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)
  const currentYearRef = useRef(initialYearData.year)

  const loadNextYear = useCallback(() => {
    if (isPending || !hasMore) return

    const nextYear = currentYearRef.current - 1

    startTransition(async () => {
      try {
        let yearToTry = nextYear
        let data = await getYearData(yearToTry)

        // Skip years with no posts (gap years) until a lower bound
        while (data.posts.length === 0 && yearToTry > 2000) {
          yearToTry -= 1
          data = await getYearData(yearToTry)
        }

        if (data.posts.length === 0) {
          setHasMore(false)
          return
        }

        currentYearRef.current = yearToTry
        setYearDataList((prev) => [...prev, data])
      } catch (error) {
        console.error('Failed to load year data:', error)
        setHasMore(false)
      }
    })
  }, [isPending, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isPending) {
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
  }, [hasMore, isPending, loadNextYear])

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
        <div ref={observerTarget}>
          {isPending ? (
            <section>
              <Skeleton className="mb-6 h-8 w-48" />
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card aria-hidden="true" key={`skeleton-${i}`}>
                    <CardHeader>
                      <Skeleton className="mb-2 h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter>
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                スクロールで続きを読み込み
              </p>
            </div>
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
