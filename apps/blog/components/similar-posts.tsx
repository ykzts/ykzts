import { getDateBasedUrl } from '@/lib/blog-urls'
import Link from 'next/link'
import DateDisplay from './date-display'
import TagList from './tag-list'

type SimilarPost = {
  excerpt: string | null
  id: string
  published_at: string
  similarity: number
  slug: string
  tags: string[] | null
  title: string
}

type SimilarPostsProps = {
  posts: SimilarPost[]
}

export default function SimilarPosts({ posts }: SimilarPostsProps) {
  // Don't render if there are no similar posts
  if (posts.length === 0) {
    return null
  }

  return (
    <section
      aria-label="類似記事"
      className="mt-12 border-gray-200 border-t pt-8"
    >
      <h2 className="mb-6 font-bold text-2xl">類似記事</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const url = getDateBasedUrl(post.slug, post.published_at)

          return (
            <article
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
              key={post.id}
            >
              <h3 className="font-semibold text-lg leading-tight">
                <Link className="hover:underline" href={url}>
                  {post.title}
                </Link>
              </h3>

              {post.excerpt && (
                <p className="line-clamp-2 text-muted-foreground text-sm">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-auto flex flex-col gap-2">
                <div className="text-muted-foreground text-xs">
                  <DateDisplay date={post.published_at} />
                </div>

                {post.tags && post.tags.length > 0 && (
                  <TagList className="flex flex-wrap gap-1" tags={post.tags} />
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
