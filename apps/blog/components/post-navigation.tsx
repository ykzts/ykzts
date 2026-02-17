import { getDateBasedUrl } from '@/lib/blog-urls'
import LinkButton from './link-button'

type PostNavigationItem = {
  slug: string
  title: string
  published_at: string
}

type PostNavigationProps = {
  previousPost: PostNavigationItem | null
  nextPost: PostNavigationItem | null
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
      {prevUrl && previousPost ? (
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-muted-foreground text-sm">前の記事</span>
          <LinkButton
            className="h-auto justify-start whitespace-normal p-4 text-left"
            href={prevUrl}
            variant="outline"
          >
            {previousPost.title}
          </LinkButton>
        </div>
      ) : (
        <div className="hidden flex-1 sm:block" />
      )}

      {nextUrl && nextPost ? (
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-muted-foreground text-sm sm:text-right">
            次の記事
          </span>
          <LinkButton
            className="h-auto justify-start whitespace-normal p-4 text-left sm:text-right"
            href={nextUrl}
            variant="outline"
          >
            {nextPost.title}
          </LinkButton>
        </div>
      ) : (
        <div className="hidden flex-1 sm:block" />
      )}
    </nav>
  )
}
