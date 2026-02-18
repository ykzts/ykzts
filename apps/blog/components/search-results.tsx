import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@ykzts/ui/components/card'
import type { Route } from 'next'
import Link from 'next/link'
import type { PortableTextValue } from '@/lib/portable-text'
import { extractFirstParagraph } from '@/lib/portable-text-utils'
import DateDisplay from './date-display'
import TagList from './tag-list'

type SearchResult = {
  excerpt: string | null
  content?: PortableTextValue | null
  id: string
  published_at: string
  similarity: number
  slug: string
  tags: string[] | null
  title: string
}

type SearchResultsProps = {
  query: string
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
      className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${colorClass}`}
    >
      関連度: {percentage}%
    </span>
  )
}

export default function SearchResults({ query, results }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-muted-foreground">
          「{query}」の検索結果が見つかりませんでした
        </p>
        <p className="mt-2 text-muted-foreground text-sm">
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
        const previewText =
          result.excerpt || extractFirstParagraph(result.content)

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
            {previewText && (
              <CardContent>
                <p className="text-muted-foreground">{previewText}</p>
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
