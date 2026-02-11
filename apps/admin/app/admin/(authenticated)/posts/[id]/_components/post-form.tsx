'use client'
import { Button } from '@ykzts/ui/components/button'
import { Input } from '@ykzts/ui/components/input'
import { Textarea } from '@ykzts/ui/components/textarea'
import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import { RichTextEditor } from '@/components/portable-text-editor'
import { PortableTextPreview } from '@/components/portable-text-preview'
import type { PostWithDetails } from '@/lib/posts'
import { generateSlug } from '@/lib/utils'
import type { ActionState } from '../actions'
import { deletePostAction, updatePostAction } from '../actions'

type PostFormProps = {
  post: PostWithDetails
}

export function PostForm({ post }: PostFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updatePostAction,
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [title, setTitle] = useState(post.title || '')
  const [slug, setSlug] = useState(post.slug || '')
  const [autoSlug, setAutoSlug] = useState(!post.slug)
  const [tags, setTags] = useState<string[]>(post.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [status, setStatus] = useState<string>(post.status || 'draft')
  const [contentPreview, setContentPreview] = useState<string | undefined>(
    post.current_version?.content
      ? JSON.stringify(post.current_version.content)
      : undefined
  )
  const [showPreview, setShowPreview] = useState(false)

  // Auto-generate slug from title if auto mode is enabled
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(generateSlug(title))
    }
  }, [title, autoSlug])

  const handleDelete = async () => {
    if (!confirm('本当にこの投稿を削除しますか？この操作は取り消せません。')) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deletePostAction(post.id)
      // If successful, deletePostAction will redirect
    } catch (error) {
      setIsDeleting(false)
      setDeleteError(
        error instanceof Error ? error.message : '削除に失敗しました'
      )
    }
  }

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

  const initialContent = post.current_version?.content
    ? JSON.stringify(post.current_version.content)
    : undefined

  return (
    <div>
      <form action={formAction} className="space-y-6">
        <input name="id" type="hidden" value={post.id} />
        <input name="tags" type="hidden" value={JSON.stringify(tags)} />

        {state?.error && (
          <div className="rounded border border-error bg-error/10 p-4 text-error">
            {state.error}
          </div>
        )}

        {deleteError && (
          <div className="rounded border border-error bg-error/10 p-4 text-error">
            {deleteError}
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
            defaultValue={post.excerpt || ''}
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
                initialValue={initialContent}
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
          <div className="mb-2 block font-medium">タグ</div>
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
            <label
              className="mb-2 block font-medium"
              htmlFor="published_at_display"
            >
              公開日時
            </label>
            {/* Hidden input that holds the ISO 8601 value actually submitted */}
            <Input
              defaultValue={post.published_at ?? ''}
              id="published_at"
              name="published_at"
              type="hidden"
            />
            {/* Visible datetime-local input for user interaction */}
            <Input
              defaultValue={
                post.published_at
                  ? new Date(post.published_at).toISOString().slice(0, 16)
                  : ''
              }
              id="published_at_display"
              name="published_at_display"
              onChange={(e) => {
                const form = e.currentTarget.form
                const hidden = form?.elements.namedItem(
                  'published_at'
                ) as HTMLInputElement | null
                if (hidden) {
                  hidden.value = e.currentTarget.value
                    ? new Date(e.currentTarget.value).toISOString()
                    : ''
                }
              }}
              type="datetime-local"
            />
            <p className="mt-1 text-muted-foreground text-sm">
              {status === 'scheduled'
                ? '指定した日時に自動公開されます'
                : '公開日時を記録します'}
            </p>
          </div>
        )}

        {/* Version History Link */}
        <div>
          <Link
            className="text-primary text-sm hover:underline"
            href={`/admin/posts/${post.id}/versions`}
          >
            バージョン履歴を表示
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            disabled={isPending || isDeleting}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            {isDeleting ? '削除中...' : '削除'}
          </Button>
          <div className="flex gap-2">
            <Button
              render={<Link href="/admin/posts" />}
              type="button"
              variant="outline"
            >
              キャンセル
            </Button>
            <Button disabled={isPending || isDeleting} type="submit">
              {isPending ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
