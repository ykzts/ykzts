import { ArrowRight } from 'lucide-react'
import { Suspense } from 'react'
import Skeleton from '@/components/skeleton'
import range from '@/lib/range'
import { getRecentPosts } from '@/lib/supabase'

function RecentPostsSkeleton() {
  return (
    <section className="mx-auto max-w-4xl py-20" id="recent-posts">
      <h2 className="mb-10 font-semibold text-base text-muted-foreground uppercase tracking-widest">
        Recent Posts
      </h2>
      <div className="space-y-6">
        {Array.from(range(0, 3), (i) => (
          <div className="border-border border-b pb-6" key={`post-${i}`}>
            <Skeleton className="mb-2 h-7 w-3/4" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Skeleton className="h-10 w-48" />
      </div>
    </section>
  )
}

async function RecentPostsImpl() {
  const posts = await getRecentPosts(3)

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="mx-auto max-w-4xl py-20" id="recent-posts">
      <h2 className="mb-10 font-semibold text-base text-muted-foreground uppercase tracking-widest">
        Recent Posts
      </h2>
      <div className="space-y-6">
        {posts.map((post) => {
          const publishedDate = new Date(post.published_at)
          const formattedDate = publishedDate.toLocaleDateString('ja-JP', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })

          const blogUrl = `/blog/${publishedDate.getFullYear()}/${String(publishedDate.getMonth() + 1).padStart(2, '0')}/${String(publishedDate.getDate()).padStart(2, '0')}/${post.slug}`

          return (
            <article className="border-border border-b pb-6" key={post.id}>
              <h3 className="mb-2 font-medium text-foreground text-xl leading-tight">
                <a
                  className="transition-colors duration-200 hover:text-primary"
                  href={blogUrl}
                >
                  {post.title}
                </a>
              </h3>
              <time
                className="text-muted-foreground text-sm"
                dateTime={post.published_at}
              >
                {formattedDate}
              </time>
            </article>
          )
        })}
      </div>
      <div className="mt-8">
        <a
          className="inline-flex items-center gap-2 rounded bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-2 focus:outline-accent focus:outline-offset-2"
          href="/blog"
        >
          すべての記事を見る
          <ArrowRight aria-hidden="true" className="size-4" />
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
