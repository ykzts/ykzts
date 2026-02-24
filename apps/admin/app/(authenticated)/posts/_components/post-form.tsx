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
import { Clipboard, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { toast } from 'sonner'
import { RichTextEditor } from '@/components/portable-text-editor'
import { generateTagsWithAI } from '@/lib/generate-tags-with-ai'
import type { PostWithDetails } from '@/lib/posts'
import { generateSlugSmart, generateUniqueSlugForPost } from '@/lib/slug'
import { getAllExistingTags } from '@/lib/tags'
import { generateSlug } from '@/lib/utils'
import { PublicUrlField } from './public-url-field'

const POST_STATUSES = [
  { label: '下書き', value: 'draft' },
  { label: '公開', value: 'published' }
] as const

function toLocalDateTimeString(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    .toISOString()
    .slice(0, 16)
}

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
  draftPreviewUrl?: string | null
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
  draftPreviewUrl,
  createAction,
  updateAction,
  deleteAction
}: PostFormProps) {
  const isEditMode = !!post
  const isSlugEditable =
    !isEditMode ||
    (post?.status !== 'published' && post?.status !== 'scheduled')
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
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
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

  const handleSuggestTags = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const form = e.currentTarget.form
    if (!form) return

    const titleInput = form.elements.namedItem(
      'title'
    ) as HTMLInputElement | null
    const contentInput = form.elements.namedItem(
      'content'
    ) as HTMLInputElement | null

    if (!titleInput?.value) {
      toast.error('タイトルを入力してください')
      return
    }

    setIsGeneratingTags(true)
    setSuggestedTags([])
    try {
      const content = contentInput?.value || '[]'
      const existingTags = await getAllExistingTags()
      const generated = await generateTagsWithAI({
        content,
        existingTags,
        title: titleInput.value
      })
      const newSuggestions = generated.filter((tag) => !tags.includes(tag))
      if (newSuggestions.length === 0 && generated.length > 0) {
        toast.info('提案されたタグはすでにすべて追加されています')
      }
      setSuggestedTags(newSuggestions)
    } catch (error) {
      console.error('Failed to generate tags:', error)
      toast.error('タグの生成に失敗しました')
    } finally {
      setIsGeneratingTags(false)
    }
  }

  const handleAddSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setSuggestedTags((prev) => prev.filter((t) => t !== tag))
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
                {!isSlugEditable && (
                  <input name="slug" type="hidden" value={slugValue} />
                )}
                <InputGroupInput
                  defaultValue={post?.slug || ''}
                  disabled={!isSlugEditable}
                  id="slug"
                  maxLength={256}
                  name={isSlugEditable ? 'slug' : undefined}
                  onChange={(e) => setSlugValue(e.target.value)}
                  placeholder="url-friendly-slug"
                  required
                  type="text"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    disabled={
                      !isSlugEditable ||
                      isGeneratingSlug ||
                      slugValue.trim() !== ''
                    }
                    onClick={handleGenerateSlug}
                    variant="secondary"
                  >
                    {isGeneratingSlug ? '生成中...' : '自動生成'}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                {isSlugEditable
                  ? 'URL用の識別子（手動入力またはボタンで自動生成）'
                  : '公開済み・予約済み投稿のスラッグは変更できません（SEO保護）'}
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
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="tag-input">タグ</FieldLabel>
                <Button
                  aria-label="AIでタグを自動提案する"
                  disabled={isGeneratingTags}
                  onClick={handleSuggestTags}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4" />
                  {isGeneratingTags ? '生成中...' : 'AIサジェスト'}
                </Button>
              </div>
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
              {suggestedTags.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-muted-foreground text-xs">
                    AIの提案（クリックで追加）:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <button
                        className="inline-flex items-center gap-1 rounded border border-dashed px-3 py-1 text-sm hover:bg-secondary"
                        key={tag}
                        onClick={() => handleAddSuggestedTag(tag)}
                        type="button"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
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
                  id="published_at"
                  name="published_at"
                  type="hidden"
                  value={publishedAtValue ?? ''}
                />
                {/* Visible datetime-local input for user interaction */}
                <Input
                  defaultValue={
                    post?.published_at
                      ? toLocalDateTimeString(new Date(post.published_at))
                      : ''
                  }
                  disabled={isEditMode && post?.status === 'published'}
                  id="published_at_display"
                  min={
                    !post?.published_at
                      ? toLocalDateTimeString(new Date())
                      : undefined
                  }
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
                draftPreviewUrl={draftPreviewUrl}
                publishedAt={publishedAtValue}
                slug={slugValue}
                status={statusValue}
              />
            )}
          </div>
        </div>

        {/* Version History Link - only in edit mode with multiple versions */}
        {isEditMode && (post.version_count ?? 0) > 1 && (
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
