'use client'

import { Field, FieldDescription, FieldLabel } from '@ykzts/ui/components/field'
import { Input } from '@ykzts/ui/components/input'
import { ExternalLink } from 'lucide-react'
import { CopyUrlButton } from '@/components/copy-url-button'
import { getBlogPostUrl } from '@/lib/blog-urls'

type PublicUrlFieldProps = {
  slug: string | null
  publishedAt: string | null
  status: 'draft' | 'scheduled' | 'published'
}

export function PublicUrlField({
  slug,
  publishedAt,
  status
}: PublicUrlFieldProps) {
  if (!slug) {
    return (
      <Field>
        <FieldLabel>公開URL</FieldLabel>
        <Input disabled type="text" value="スラッグが設定されていません" />
        <FieldDescription>
          スラッグを設定すると、URLが表示されます
        </FieldDescription>
      </Field>
    )
  }

  const url = getBlogPostUrl(slug, publishedAt)

  if (!url) {
    return (
      <Field>
        <FieldLabel>公開URL</FieldLabel>
        <Input disabled type="text" value="公開日時が設定されていません" />
        <FieldDescription>
          {status === 'draft'
            ? '下書き状態のため、公開URLはありません'
            : '公開日時を設定すると、URLが表示されます'}
        </FieldDescription>
      </Field>
    )
  }

  return (
    <Field>
      <FieldLabel>公開URL</FieldLabel>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            className="pr-10"
            onClick={(e) => e.currentTarget.select()}
            readOnly
            type="text"
            value={url}
          />
          <a
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            title="新しいタブで開く"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <CopyUrlButton label="コピー" url={url} />
      </div>
      <FieldDescription>
        {status === 'scheduled'
          ? '予約公開のURL（指定日時に自動公開されます）'
          : 'この投稿の公開URL'}
      </FieldDescription>
    </Field>
  )
}
