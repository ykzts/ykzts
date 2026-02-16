'use client'
import { Alert, AlertDescription } from '@ykzts/ui/components/alert'
import { Button } from '@ykzts/ui/components/button'
import { Input } from '@ykzts/ui/components/input'

import { useActionState, useState } from 'react'
import { RichTextEditor } from '@/components/portable-text-editor'
import { generateUniqueSlugForWork } from '@/lib/slug'
import { generateSlug } from '@/lib/utils'
import type { ActionState } from './actions'
import { deleteWork, updateWork } from './actions'

type WorkFormProps = {
  work: {
    content: unknown
    created_at: string
    id: string
    slug: string
    starts_at: string
    title: string
    updated_at: string
  }
}

export function WorkForm({ work }: WorkFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateWork,
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)

  const handleDelete = async () => {
    if (!confirm('本当にこの作品を削除しますか？この操作は取り消せません。')) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteWork(work.id)
      // If successful, deleteWork will redirect
    } catch (error) {
      setIsDeleting(false)
      setDeleteError(
        error instanceof Error ? error.message : '削除に失敗しました'
      )
    }
  }

  const handleGenerateSlug = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const form = e.currentTarget.form
    if (!form) return

    const titleInput = form.elements.namedItem(
      'title'
    ) as HTMLInputElement | null
    const slugInput = form.elements.namedItem('slug') as HTMLInputElement | null

    if (titleInput?.value && slugInput) {
      setIsGeneratingSlug(true)
      try {
        // Use server action to generate unique slug, excluding current work
        const uniqueSlug = await generateUniqueSlugForWork(
          titleInput.value,
          work.id
        )
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

  // Convert content to JSON string for editor
  const contentString =
    typeof work.content === 'string'
      ? work.content
      : JSON.stringify(work.content ?? '')

  return (
    <div>
      <form action={formAction} className="space-y-6">
        <input name="id" type="hidden" value={work.id} />

        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {deleteError && (
          <Alert variant="destructive">
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}

        <div>
          <label className="mb-2 block font-medium" htmlFor="title">
            タイトル <span className="text-error">*</span>
          </label>
          <Input
            defaultValue={work.title}
            id="title"
            maxLength={256}
            name="title"
            required
            type="text"
          />
          <p className="mt-1 text-muted-foreground text-sm">1〜256文字</p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="slug">
            スラッグ <span className="text-error">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              className="flex-1 font-mono"
              defaultValue={work.slug}
              id="slug"
              name="slug"
              pattern="^[a-zA-Z0-9\-_]+$"
              required
              type="text"
            />
            <Button
              disabled={isGeneratingSlug}
              onClick={handleGenerateSlug}
              type="button"
              variant="secondary"
            >
              {isGeneratingSlug ? '生成中...' : '自動生成'}
            </Button>
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            英数字、ハイフン、アンダースコアのみ使用可能
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="starts_at">
            開始日 <span className="text-error">*</span>
          </label>
          <Input
            defaultValue={work.starts_at}
            id="starts_at"
            name="starts_at"
            required
            type="date"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="content">
            コンテンツ <span className="text-error">*</span>
          </label>
          <RichTextEditor
            id="content"
            initialValue={contentString}
            name="content"
          />
        </div>

        <div className="flex justify-between gap-4">
          <Button
            disabled={isPending || isDeleting}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            {isDeleting ? '削除中...' : '削除'}
          </Button>
          <Button disabled={isPending || isDeleting} type="submit">
            {isPending ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </div>
  )
}
