import { extractFirstParagraph } from '@ykzts/portable-text-utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@ykzts/ui/components/card'
import Link from 'next/link'
import { getPostUrl } from '@/lib/blog-urls'
import type { PortableTextValue } from '@/lib/portable-text'
import DateDisplay from './date-display'
import TagList from './tag-list'

type Post = {
  slug: string
  title: string
  excerpt: string | null
  content?: PortableTextValue | null
  published_at: string | null
  tags: string[] | null
  profile?: {
    id: string
    name: string
  } | null
}

type PostCardProps = {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const url = getPostUrl(post.slug, post.published_at)
  const previewText = post.excerpt || extractFirstParagraph(post.content)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link className="hover:underline" href={url}>
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-4">
          {post.profile?.name && <span>著者: {post.profile.name}</span>}
          <DateDisplay date={post.published_at} />
        </CardDescription>
      </CardHeader>
      {previewText && (
        <CardContent>
          <p className="text-muted-foreground">{previewText}</p>
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
