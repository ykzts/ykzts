'use client'
import { Button } from '@ykzts/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldLabel
} from '@ykzts/ui/components/field'
import { Input } from '@ykzts/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ykzts/ui/components/select'
import { Textarea } from '@ykzts/ui/components/textarea'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { RichTextEditor } from '@/components/portable-text-editor'
import { generateUniqueSlugForPost } from '@/lib/slug'
import { generateSlug } from '@/lib/utils'
import type { ActionState } from './actions'
import { createPostAction } from './actions'

export function PostForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createPostAction,
    null
  )

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showPublishedAt, setShowPublishedAt] = useState(false)
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)

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

    if (titleInput && slugInput && titleInput.value) {
      setIsGeneratingSlug(true)
      try {
        // Use server action to generate unique slug
        const uniqueSlug = await generateUniqueSlugForPost(titleInput.value)
        slugInput.value = uniqueSlug
      } catch (error) {
        // Fallback to client-side generation if server action fails
        console.error('Failed to generate unique slug:', error)
        slugInput.value = generateSlug(titleInput.value)
      } finally {
        setIsGeneratingSlug(false)
      }
    }
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
        <Field>
          <FieldLabel htmlFor="title">
            タイトル <span className="text-error">*</span>
          </FieldLabel>
          <Input
            id="title"
            maxLength={256}
            name="title"
            placeholder="投稿のタイトルを入力"
            required
            type="text"
          />
          <FieldDescription>必須、256文字以内</FieldDescription>
        </Field>

        {/* Slug */}
        <Field>
          <FieldLabel htmlFor="slug">
            スラッグ <span className="text-error">*</span>
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              id="slug"
              maxLength={256}
              name="slug"
              placeholder="url-friendly-slug"
              required
              type="text"
            />
            <Button
              disabled={isGeneratingSlug}
              onClick={handleGenerateSlug}
              type="button"
              variant="outline"
            >
              {isGeneratingSlug ? '生成中...' : '自動生成'}
            </Button>
          </div>
          <FieldDescription>
            URL用の識別子（手動入力またはボタンで自動生成）
          </FieldDescription>
        </Field>

        {/* Excerpt */}
        <Field>
          <FieldLabel htmlFor="excerpt">抜粋</FieldLabel>
          <Textarea
            id="excerpt"
            name="excerpt"
            placeholder="投稿の簡単な説明（任意）"
            rows={3}
          />
          <FieldDescription>投稿の要約や説明文</FieldDescription>
        </Field>

        {/* Content */}
        <Field>
          <FieldLabel htmlFor="content">コンテンツ</FieldLabel>
          <RichTextEditor
            id="content"
            name="content"
            placeholder="投稿の本文を入力..."
          />
        </Field>

        {/* Tags */}
        <Field>
          <FieldLabel>タグ</FieldLabel>
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
        </Field>

        {/* Status */}
        <Field>
          <FieldLabel htmlFor="status">ステータス</FieldLabel>
          <Select
            defaultValue="draft"
            name="status"
            onValueChange={(value) => {
              setShowPublishedAt(value === 'scheduled' || value === 'published')
            }}
          >
            <SelectTrigger className="w-full" id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">下書き</SelectItem>
              <SelectItem value="scheduled">予約公開</SelectItem>
              <SelectItem value="published">公開</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {/* Published At */}
        {showPublishedAt && (
          <Field>
            <FieldLabel htmlFor="published_at_display">公開日時</FieldLabel>
            {/* Hidden input that holds the ISO 8601 value actually submitted */}
            <input id="published_at" name="published_at" type="hidden" />
            {/* Visible datetime-local input for user interaction */}
            <Input
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
            <FieldDescription>
              指定した日時に自動公開されます
            </FieldDescription>
          </Field>
        )}

        {/* Action Buttons */}
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
      </form>
    </div>
  )
}
