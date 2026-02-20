'use client'

import { parseMarkdownForPost } from '@ykzts/portable-text-utils'
import { Button } from '@ykzts/ui/components/button'
import { Field, FieldDescription, FieldLabel } from '@ykzts/ui/components/field'
import { Input } from '@ykzts/ui/components/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@ykzts/ui/components/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ykzts/ui/components/select'
import { Textarea } from '@ykzts/ui/components/textarea'
import { Clipboard } from 'lucide-react'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { toast } from 'sonner'
import { RichTextEditor } from '@/components/portable-text-editor'
import type { PostWithDetails } from '@/lib/posts'
import { generateSlugSmart, generateUniqueSlugForPost } from '@/lib/slug'
import { generateSlug } from '@/lib/utils'
import { PublicUrlField } from './public-url-field'

const POST_STATUSES = [
  { label: '下書き', value: 'draft' },
  { label: '公開', value: 'published' }
] as const

function formatPublishedAt(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}

type ActionState = {
  error?: string
  success?: boolean
} | null

type PostFormProps = {
  post?: PostWithDetails
  draftSecret?: string | null
  createAction?: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>
  updateAction?: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>
  deleteAction?: (id: string) => Promise<void>
}

export function PostForm({
  post,
  draftSecret,
  createAction,
  updateAction,
  deleteAction
}: PostFormProps) {
  const isEditMode = !!post
  const formAction = isEditMode ? updateAction : createAction

  if (!formAction) {
    throw new Error('Either createAction or updateAction must be provided')
  }

  const [state, submitAction, isPending] = useActionState<
    ActionState,
    FormData
  >(formAction, null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [tags, setTags] = useState<string[]>(post?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [showPublishedAt, setShowPublishedAt] = useState(
    post?.status === 'scheduled' || post?.status === 'published' || false
  )
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)
  const [slugValue, setSlugValue] = useState(post?.slug || '')
  const [statusValue, setStatusValue] = useState<'draft' | 'published'>(
    post?.status === 'published' || post?.status === 'scheduled'
      ? 'published'
      : 'draft'
  )
  const [publishedAtValue, setPublishedAtValue] = useState<string | null>(
    post?.published_at || null
  )
  const [titleValue, setTitleValue] = useState(post?.title || '')
  const [editorKey, setEditorKey] = useState(0)
  const [isLoadingClipboard, setIsLoadingClipboard] = useState(false)

  const initialContent = post?.current_version?.content
    ? JSON.stringify(post.current_version.content)
    : undefined
  const [editorContent, setEditorContent] = useState<string | undefined>(
    initialContent
  )

  const handleLoadFromClipboard = async () => {
    setIsLoadingClipboard(true)
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        toast.error('クリップボードにテキストがありません')
        return
      }
      const { title, contentJson } = parseMarkdownForPost(text)
      if (title) {
        setTitleValue(title)
      }
      setEditorContent(contentJson)
      setEditorKey((prev) => prev + 1)
      toast.success('クリップボードから読み込みました')
    } catch (error) {
      console.error('Failed to read from clipboard:', error)
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.error('クリップボードへのアクセスが拒否されました')
      } else {
        toast.error('クリップボードの読み込みに失敗しました')
      }
    } finally {
      setIsLoadingClipboard(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteAction || !post) return

    if (!confirm('本当にこの投稿を削除しますか？この操作は取り消せません。')) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteAction(post.id)
      // If successful, deleteAction will redirect
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

  const handleGenerateSlug = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const form = e.currentTarget.form
    if (!form) return

    const titleInput = form.elements.namedItem(
      'title'
    ) as HTMLInputElement | null
    const slugInput = form.elements.namedItem('slug') as HTMLInputElement | null
    const contentInput = form.elements.namedItem(
      'content'
    ) as HTMLInputElement | null

    if (titleInput && slugInput && titleInput.value) {
      setIsGeneratingSlug(true)
      try {
        // Get content from the hidden input (PortableText JSON)
        const content = contentInput?.value || '[]'

        // Use AI-powered slug generation with fallback, excluding current post
        const uniqueSlug = await generateSlugSmart({
          content,
          excludeId: post?.id,
          table: 'posts',
          title: titleInput.value
        })
        slugInput.value = uniqueSlug
        setSlugValue(uniqueSlug)
      } catch (error) {
        // Ultimate fallback to client-side generation if all else fails
        console.error('Failed to generate unique slug:', error)
        try {
          const uniqueSlug = await generateUniqueSlugForPost(
            titleInput.value,
            post?.id
          )
          slugInput.value = uniqueSlug
          setSlugValue(uniqueSlug)
        } catch (fallbackError) {
          console.error('Fallback slug generation also failed:', fallbackError)
          const fallbackSlug = generateSlug(titleInput.value)
          slugInput.value = fallbackSlug
          setSlugValue(fallbackSlug)
        }
      } finally {
        setIsGeneratingSlug(false)
      }
    }
  }

  return (
    <div>
      <form action={submitAction} className="space-y-6">
        {isEditMode && <input name="id" type="hidden" value={post.id} />}
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

        {/* Two-column layout: Main content on left, metadata on right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* Title */}
            <Field>
              <FieldLabel htmlFor="title">
                タイトル <span className="text-error">*</span>
              </FieldLabel>
              <Input
                id="title"
                maxLength={256}
                name="title"
                onChange={(e) => setTitleValue(e.target.value)}
                placeholder="投稿のタイトルを入力"
                required
                type="text"
                value={titleValue}
              />
              <FieldDescription>必須、256文字以内</FieldDescription>
            </Field>

            {/* Content */}
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="content">コンテンツ</FieldLabel>
                <Button
                  aria-label="クリップボードからマークダウンを読み込む"
                  disabled={isLoadingClipboard}
                  onClick={handleLoadFromClipboard}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Clipboard className="h-4 w-4" />
                  {isLoadingClipboard
                    ? '読み込み中...'
                    : 'クリップボードから読み込む'}
                </Button>
              </div>
              <RichTextEditor
                id="content"
                initialValue={editorContent}
                key={editorKey}
                name="content"
                placeholder="投稿の本文を入力..."
              />
            </Field>
          </div>

          {/* Right Column - Metadata Sidebar */}
          <div className="space-y-6">
            {/* Slug */}
            <Field>
              <FieldLabel htmlFor="slug">
                スラッグ <span className="text-error">*</span>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  defaultValue={post?.slug || ''}
                  id="slug"
                  maxLength={256}
                  name="slug"
                  onChange={(e) => setSlugValue(e.target.value)}
                  placeholder="url-friendly-slug"
                  required
                  type="text"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    disabled={isGeneratingSlug || slugValue.trim() !== ''}
                    onClick={handleGenerateSlug}
                    variant="secondary"
                  >
                    {isGeneratingSlug ? '生成中...' : '自動生成'}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                URL用の識別子（手動入力またはボタンで自動生成）
              </FieldDescription>
            </Field>

            {/* Excerpt */}
            <Field>
              <FieldLabel htmlFor="excerpt">抜粋</FieldLabel>
              <Textarea
                defaultValue={post?.excerpt || ''}
                id="excerpt"
                name="excerpt"
                placeholder="投稿の簡単な説明（任意）"
                rows={3}
              />
              <FieldDescription>投稿の要約や説明文</FieldDescription>
            </Field>

            {/* Tags */}
            <Field>
              <FieldLabel htmlFor="tag-input">タグ</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="tag-input"
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
                        aria-label={`"${tag}" タグを削除`}
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
            </Field>

            {/* Status */}
            <Field>
              <FieldLabel htmlFor="status">ステータス</FieldLabel>
              <Select
                defaultValue={
                  post?.status === 'published' || post?.status === 'scheduled'
                    ? 'published'
                    : 'draft'
                }
                items={POST_STATUSES}
                name="status"
                onValueChange={(value) => {
                  const newStatus = value as 'draft' | 'published'
                  setStatusValue(newStatus)
                  setShowPublishedAt(newStatus === 'published')
                }}
              >
                <SelectTrigger className="w-full" id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Published At */}
            {showPublishedAt && (
              <Field>
                <FieldLabel htmlFor="published_at_display">公開日時</FieldLabel>
                {/* Hidden input that holds the ISO 8601 value actually submitted */}
                <input
                  defaultValue={post?.published_at ?? ''}
                  id="published_at"
                  name="published_at"
                  type="hidden"
                />
                {/* Visible datetime-local input for user interaction */}
                <Input
                  defaultValue={
                    post?.published_at
                      ? (() => {
                          const d = new Date(post.published_at)
                          return new Date(
                            d.getTime() - d.getTimezoneOffset() * 60 * 1000
                          )
                            .toISOString()
                            .slice(0, 16)
                        })()
                      : ''
                  }
                  id="published_at_display"
                  name="published_at_display"
                  onChange={(e) => {
                    const form = e.currentTarget.form
                    const hidden = form?.elements.namedItem(
                      'published_at'
                    ) as HTMLInputElement | null
                    const newValue = e.currentTarget.value
                      ? new Date(e.currentTarget.value).toISOString()
                      : ''
                    if (hidden) {
                      hidden.value = newValue
                    }
                    setPublishedAtValue(newValue || null)
                  }}
                  type="datetime-local"
                />
                <FieldDescription>
                  指定した日時に自動公開されます
                </FieldDescription>
              </Field>
            )}

            {/* Publication status message */}
            {statusValue === 'published' && (
              <p className="text-muted-foreground text-sm">
                {publishedAtValue && new Date(publishedAtValue) > new Date()
                  ? `この投稿は ${formatPublishedAt(publishedAtValue)} に自動公開されます`
                  : 'この投稿はすぐに公開されます'}
              </p>
            )}

            {/* Public URL - Only show in edit mode */}
            {isEditMode && (
              <PublicUrlField
                draftSecret={draftSecret}
                publishedAt={publishedAtValue}
                slug={slugValue}
                status={statusValue}
              />
            )}
          </div>
        </div>

        {/* Version History Link - only in edit mode */}
        {isEditMode && (
          <div>
            <Link
              className="text-primary text-sm hover:underline"
              href={`/posts/${post.id}/versions`}
            >
              バージョン履歴を表示
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        {isEditMode ? (
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
                render={<Link href="/posts" />}
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
        ) : (
          <div className="flex justify-end gap-2">
            <Button
              render={<Link href="/posts" />}
              type="button"
              variant="outline"
            >
              キャンセル
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? '作成中...' : '作成'}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
