import { buttonVariants } from '@ykzts/ui/components/button'
import { cn } from '@ykzts/ui/lib/utils'
import type { Route } from 'next'
import Link from 'next/link'

type PostNavigationItem = {
  slug: string
  title: string
  published_at: string
}

type PostNavigationProps = {
  previousPost: PostNavigationItem | null
  nextPost: PostNavigationItem | null
}

function getDateBasedUrl(slug: string, publishedAt: string): Route {
  const date = new Date(publishedAt)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `/blog/${year}/${month}/${day}/${slug}` as Route
}

export default function PostNavigation({
  previousPost,
  nextPost
}: PostNavigationProps) {
  // Don't render if there are no adjacent posts
  if (!previousPost && !nextPost) {
    return null
  }

  const prevUrl = previousPost
    ? getDateBasedUrl(previousPost.slug, previousPost.published_at)
    : null
  const nextUrl = nextPost
    ? getDateBasedUrl(nextPost.slug, nextPost.published_at)
    : null

  return (
    <nav
      aria-label="記事ナビゲーション"
      className="mt-12 flex flex-col gap-4 border-gray-200 border-t pt-8 sm:flex-row sm:justify-between"
    >
      <div className="flex-1">
        {prevUrl && previousPost ? (
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm">前の記事</span>
            <Link
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-auto justify-start whitespace-normal p-4 text-left'
              )}
              href={prevUrl}
            >
              {previousPost.title}
            </Link>
          </div>
        ) : (
          <div className="invisible" />
        )}
      </div>

      <div className="flex-1">
        {nextUrl && nextPost ? (
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm sm:text-right">
              次の記事
            </span>
            <Link
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-auto justify-start whitespace-normal p-4 text-left sm:text-right'
              )}
              href={nextUrl}
            >
              {nextPost.title}
            </Link>
          </div>
        ) : (
          <div className="invisible" />
        )}
      </div>
    </nav>
  )
}
