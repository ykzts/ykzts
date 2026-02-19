'use client'

import { ExternalLink } from 'lucide-react'
import { CopyUrlButton } from '@/components/copy-url-button'
import { getBlogPostUrl } from '@/lib/blog-urls'

type PublicUrlCellProps = {
  slug: string | null
  publishedAt: string | null
  status: 'draft' | 'scheduled' | 'published' | null
}

export function PublicUrlCell({
  slug,
  publishedAt,
  status
}: PublicUrlCellProps) {
  if (!slug) {
    return <span className="text-muted-foreground text-sm">-</span>
  }

  const url = getBlogPostUrl(slug, publishedAt)

  if (!url) {
    return <span className="text-muted-foreground text-sm">-</span>
  }

  return (
    <div className="flex items-center gap-2">
      <a
        className="text-primary hover:underline flex items-center gap-1 text-sm truncate max-w-[200px]"
        href={url}
        rel="noopener noreferrer"
        target="_blank"
        title={url}
      >
        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">
          {status === 'scheduled' ? '予約公開URL' : '公開URL'}
        </span>
      </a>
      <CopyUrlButton size="icon" url={url} variant="ghost" />
    </div>
  )
}
