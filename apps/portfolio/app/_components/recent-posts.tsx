import { getPosts } from '@ykzts/supabase/queries'
import { Suspense } from 'react'
import Skeleton from '@/components/skeleton'
import range from '@/lib/range'

const RECENT_POSTS_COUNT = 5

function getDateBasedUrl(slug: string, publishedAt: string): string {
  const date = new Date(publishedAt)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `/blog/${year}/${month}/${day}/${slug}`
}

function RecentPostsSkeleton() {
  return (
    <section className="mx-auto max-w-4xl py-20" id="blog">
      <h2 className="mb-12 font-semibold text-base text-muted-foreground uppercase tracking-widest">
        Blog
      </h2>
      <div className="space-y-6">
        {Array.from(range(0, RECENT_POSTS_COUNT - 1), (i) => (
          <article
            className="rounded-xl border border-border bg-card p-6"
            key={`skeleton-${i}`}
          >
            <Skeleton className="mb-3 h-5 w-2/3" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-4 h-4 w-4/5" />
            <Skeleton className="h-3 w-24" />
          </article>
        ))}
      </div>
    </section>
  )
}

async function RecentPostsImpl() {
  let allPosts: Awaited<ReturnType<typeof getPosts>>

  try {
    allPosts = await getPosts()
  } catch (error) {
    console.error('Failed to load recent posts:', error)
    return null
  }

  const posts = allPosts.slice(0, RECENT_POSTS_COUNT)

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="mx-auto max-w-4xl py-20" id="blog">
      <h2 className="mb-12 font-semibold text-base text-muted-foreground uppercase tracking-widest">
        Blog
      </h2>
      <div className="space-y-6">
        {posts.map((post) => {
          const url = post.published_at
            ? getDateBasedUrl(post.slug, post.published_at)
            : `/blog/draft/${post.slug}`

          return (
            <article
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md"
              key={post.id}
            >
              <h3 className="mb-2 font-semibold text-card-foreground text-lg">
                <a className="hover:text-primary hover:underline" href={url}>
                  {post.title}
                </a>
              </h3>
              {post.excerpt && (
                <p className="mb-3 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                {post.published_at && (
                  <time
                    className="text-muted-foreground text-xs"
                    dateTime={post.published_at}
                  >
                    {new Date(post.published_at).toLocaleDateString('ja-JP', {
                      day: 'numeric',
                      month: 'long',
                      timeZone: 'UTC',
                      year: 'numeric'
                    })}
                  </time>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-muted-foreground text-xs"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
      <div className="mt-8 text-center">
        <a
          className="inline-flex items-center rounded-lg border border-border bg-card px-6 py-3 font-medium text-card-foreground transition-all duration-300 hover:border-primary/50 hover:shadow-md"
          href="/blog"
        >
          ブログをすべて見る
        </a>
      </div>
    </section>
  )
}

export default function RecentPosts() {
  return (
    <Suspense fallback={<RecentPostsSkeleton />}>
      <RecentPostsImpl />
    </Suspense>
  )
}
