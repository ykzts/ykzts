import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@ykzts/ui/components/card'
import Link from 'next/link'
import { getDateBasedUrl } from '@/lib/blog-urls'
import DateDisplay from './date-display'
import TagList from './tag-list'

type SimilarPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  published_at: string
  tags: string[] | null
  similarity: number
}

type SimilarPostsProps = {
  posts: SimilarPost[]
}

export default function SimilarPosts({ posts }: SimilarPostsProps) {
  // Don't render if there are no similar posts
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="similar-posts-heading" className="mt-16">
      <h2 className="mb-6 font-bold text-2xl" id="similar-posts-heading">
        関連記事
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const url = getDateBasedUrl(post.slug, post.published_at)
          return (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link className="hover:underline" href={url}>
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  <DateDisplay date={post.published_at} />
                </CardDescription>
              </CardHeader>
              {post.excerpt && (
                <CardContent>
                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {post.excerpt}
                  </p>
                </CardContent>
              )}
              {post.tags && post.tags.length > 0 && (
                <CardFooter>
                  <TagList className="flex flex-wrap gap-2" tags={post.tags} />
                </CardFooter>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}
