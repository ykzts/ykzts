'use client'

import { Field, FieldDescription, FieldLabel } from '@ykzts/ui/components/field'
import { Input } from '@ykzts/ui/components/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@ykzts/ui/components/input-group'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getBlogPostUrl } from '@/lib/blog-urls'

type PublicUrlFieldProps = {
  slug: string | null
  publishedAt: string | null
  status: 'draft' | 'scheduled' | 'published'
  draftPreviewUrl?: string | null
}

export function PublicUrlField({
  slug,
  publishedAt,
  status,
  draftPreviewUrl
}: PublicUrlFieldProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

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
  const displayUrl = url ?? draftPreviewUrl ?? null

  if (!displayUrl) {
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

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(displayUrl)
      setCopied(true)
      toast.success('URLをコピーしました')

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
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
    window.open(displayUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Field>
      <FieldLabel>公開URL</FieldLabel>
      <InputGroup>
        <InputGroupInput
          onClick={(e) => e.currentTarget.select()}
          readOnly
          type="text"
          value={displayUrl}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="新しいタブで開く"
            onClick={handleOpenInNewTab}
            title="新しいタブで開く"
            type="button"
            variant="ghost"
          >
            <ExternalLink />
          </InputGroupButton>
          <InputGroupButton
            aria-label="URLをコピー"
            onClick={handleCopy}
            title="URLをコピー"
            type="button"
            variant="ghost"
          >
            {copied ? <Check /> : <Copy />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription>
        {!url && draftPreviewUrl
          ? 'ドラフトプレビュー用のURL（公開前の確認に使用）'
          : status === 'scheduled'
            ? '予約公開のURL（指定日時に自動公開されます）'
            : 'この投稿の公開URL'}
      </FieldDescription>
    </Field>
  )
}
