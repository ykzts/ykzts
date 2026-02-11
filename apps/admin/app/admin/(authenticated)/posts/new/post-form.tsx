'use client'
import { Button } from '@ykzts/ui/components/button'
import { Input } from '@ykzts/ui/components/input'
import { Textarea } from '@ykzts/ui/components/textarea'
import { PortableTextPreview } from '@/components/portable-text-preview'
import { RichTextEditor } from '@/components/portable-text-editor'

import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import type { ActionState } from './actions'
import { createPostAction } from './actions'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function PostForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createPostAction,
    null
  )

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [status, setStatus] = useState<string>('draft')
  const [contentPreview, setContentPreview] = useState<string | undefined>()
  const [showPreview, setShowPreview] = useState(false)

  // Auto-generate slug from title if auto mode is enabled
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(generateSlug(title))
    }
  }, [title, autoSlug])

  const handleAddTag = () => {
    const newTag = tagInput.trim()
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div>
      <form action={formAction} className="space-y-6">
        <input name="tags" type="hidden" value={JSON.stringify(tags)} />

        {state?.error && (
          <div className="rounded border border-error bg-error/10 p-4 text-error">
            {state.error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="mb-2 block font-medium" htmlFor="title">
            タイトル <span className="text-error">*</span>
          </label>
          <Input
            id="title"
            maxLength={256}
            name="title"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="投稿のタイトルを入力"
            required
            type="text"
            value={title}
          />
          <p className="mt-1 text-muted-foreground text-sm">
            必須、256文字以内
          </p>
        </div>

        {/* Slug */}
        <div>
          <label className="mb-2 block font-medium" htmlFor="slug">
            スラッグ <span className="text-error">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              disabled={autoSlug}
              id="slug"
              maxLength={256}
              name="slug"
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-friendly-slug"
              required
              type="text"
              value={slug}
            />
            <Button
              onClick={() => setAutoSlug(!autoSlug)}
              type="button"
              variant="outline"
            >
              {autoSlug ? '手動' : '自動'}
            </Button>
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            URL用の識別子（自動生成または手動入力）
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-2 block font-medium" htmlFor="excerpt">
            抜粋
          </label>
          <Textarea
            id="excerpt"
            name="excerpt"
            placeholder="投稿の簡単な説明（任意）"
            rows={3}
          />
          <p className="mt-1 text-muted-foreground text-sm">
            投稿の要約や説明文
          </p>
        </div>

        {/* Content */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block font-medium" htmlFor="content">
              コンテンツ
            </label>
            <Button
              onClick={() => setShowPreview(!showPreview)}
              size="sm"
              type="button"
              variant="outline"
            >
              {showPreview ? 'プレビューを隠す' : 'プレビューを表示'}
            </Button>
          </div>
          <div className={showPreview ? 'grid grid-cols-2 gap-4' : ''}>
            <div>
              <RichTextEditor
                id="content"
                name="content"
                onChange={(value) => setContentPreview(value)}
                placeholder="投稿の本文を入力..."
              />
            </div>
            {showPreview && (
              <div className="rounded border border-border bg-card p-4">
                <h3 className="mb-3 font-medium text-sm">プレビュー</h3>
                <PortableTextPreview value={contentPreview} />
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-2 block font-medium">タグ</label>
          <div className="flex gap-2">
            <Input
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              placeholder="タグを入力してEnter"
              type="text"
              value={tagInput}
            />
            <Button onClick={handleAddTag} type="button" variant="outline">
              追加
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  className="inline-flex items-center gap-1 rounded bg-secondary px-3 py-1 text-sm"
                  key={tag}
                >
                  {tag}
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveTag(tag)}
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block font-medium" htmlFor="status">
            ステータス
          </label>
          <select
            className="w-full rounded border border-border bg-background px-3 py-2"
            id="status"
            name="status"
            onChange={(e) => setStatus(e.target.value)}
            value={status}
          >
            <option value="draft">下書き</option>
            <option value="scheduled">予約公開</option>
            <option value="published">公開</option>
          </select>
        </div>

        {/* Published At */}
        {(status === 'scheduled' || status === 'published') && (
          <div>
            <label className="mb-2 block font-medium" htmlFor="published_at">
              公開日時
            </label>
            <Input
              id="published_at"
              name="published_at"
              type="datetime-local"
            />
            <p className="mt-1 text-muted-foreground text-sm">
              {status === 'scheduled'
                ? '指定した日時に自動公開されます'
                : '公開日時を記録します'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            render={<Link href="/admin/posts" />}
            type="button"
            variant="outline"
          >
            キャンセル
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? '作成中...' : '作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}
