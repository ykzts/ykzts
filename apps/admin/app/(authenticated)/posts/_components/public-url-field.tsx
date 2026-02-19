'use client'

import { Field, FieldDescription, FieldLabel } from '@ykzts/ui/components/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@ykzts/ui/components/input-group'
import { Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
  const [copied, setCopied] = useState(false)

  if (!slug) {
    return (
      <Field>
        <FieldLabel>公開URL</FieldLabel>
        <InputGroupInput
          disabled
          type="text"
          value="スラッグが設定されていません"
        />
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
        <InputGroupInput
          disabled
          type="text"
          value="公開日時が設定されていません"
        />
        <FieldDescription>
          {status === 'draft'
            ? '下書き状態のため、公開URLはありません'
            : '公開日時を設定すると、URLが表示されます'}
        </FieldDescription>
      </Field>
    )
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('URLをコピーしました')

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
      toast.error('URLのコピーに失敗しました')
    }
  }

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Field>
      <FieldLabel>公開URL</FieldLabel>
      <InputGroup>
        <InputGroupInput
          onClick={(e) => e.currentTarget.select()}
          readOnly
          type="text"
          value={url}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onClick={handleOpenInNewTab}
            title="新しいタブで開く"
            type="button"
            variant="ghost"
          >
            <ExternalLink />
          </InputGroupButton>
          <InputGroupButton
            onClick={handleCopy}
            title="URLをコピー"
            type="button"
            variant="ghost"
          >
            {copied ? <Copy className="fill-current" /> : <Copy />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription>
        {status === 'scheduled'
          ? '予約公開のURL（指定日時に自動公開されます）'
          : 'この投稿の公開URL'}
      </FieldDescription>
    </Field>
  )
}
