import { Badge } from '@ykzts/ui/components/badge'
import Link from 'next/link'

type TagListProps = {
  tags: string[]
  className?: string
}

export default function TagList({ tags, className }: TagListProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {tags.map((tag) => (
        <Link href={`/tags/${tag}`} key={tag}>
          <Badge variant="secondary">{tag}</Badge>
        </Link>
      ))}
    </div>
  )
}
