import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@ykzts/ui/components/card'
import Link from 'next/link'
import DateDisplay from './date-display'
import TagList from './tag-list'

type Post = {
  slug: string
  title: string
  excerpt: string | null
  published_at: string
  tags: string[] | null
}

type PostCardProps = {
  post: Post
}

function getDateBasedUrl(slug: string, publishedAt: string): string {
  const date = new Date(publishedAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `/${year}/${month}/${day}/${slug}`
}

export default function PostCard({ post }: PostCardProps) {
  const url = getDateBasedUrl(post.slug, post.published_at)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
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
          <p className="text-muted-foreground">{post.excerpt}</p>
        </CardContent>
      )}
      {post.tags && post.tags.length > 0 && (
        <CardFooter>
          <TagList className="flex flex-wrap gap-2" tags={post.tags} />
        </CardFooter>
      )}
    </Card>
  )
}
