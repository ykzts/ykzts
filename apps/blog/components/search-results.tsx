import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@ykzts/ui/components/card'
import { Skeleton } from '@ykzts/ui/components/skeleton'
import type { Route } from 'next'
import Link from 'next/link'
import DateDisplay from './date-display'
import TagList from './tag-list'

type SearchResult = {
  excerpt: string | null
  id: string
  published_at: string
  similarity: number
  slug: string
  tags: string[] | null
  title: string
}

type SearchResultsProps = {
  isLoading: boolean
  results: SearchResult[]
}

function getDateBasedUrl(slug: string, publishedAt: string): Route {
  const date = new Date(publishedAt)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `/blog/${year}/${month}/${day}/${slug}` as Route
}

function SimilarityBadge({ similarity }: { similarity: number }) {
  const percentage = Math.round(similarity * 100)
  const colorClass =
    percentage >= 85
      ? 'bg-green-100 text-green-800'
      : percentage >= 70
        ? 'bg-blue-100 text-blue-800'
        : 'bg-gray-100 text-gray-800'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}
    >
      関連度: {percentage}%
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function SearchResults({
  isLoading,
  results
}: SearchResultsProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          検索結果が見つかりませんでした
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          別のキーワードで検索してみてください
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        {results.length}件の記事が見つかりました
      </p>
      {results.map((result) => {
        const url = getDateBasedUrl(result.slug, result.published_at)

        return (
          <Card key={result.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="flex-1">
                  <Link className="hover:underline" href={url}>
                    {result.title}
                  </Link>
                </CardTitle>
                <SimilarityBadge similarity={result.similarity} />
              </div>
              <CardDescription>
                <DateDisplay date={result.published_at} />
              </CardDescription>
            </CardHeader>
            {result.excerpt && (
              <CardContent>
                <p className="text-muted-foreground">{result.excerpt}</p>
              </CardContent>
            )}
            {result.tags && result.tags.length > 0 && (
              <CardFooter>
                <TagList className="flex flex-wrap gap-2" tags={result.tags} />
              </CardFooter>
            )}
          </Card>
        )
      })}
    </div>
  )
}
