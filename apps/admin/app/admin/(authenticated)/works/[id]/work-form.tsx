'use client'
import { Button } from '@ykzts/ui/button'
import { Input } from '@ykzts/ui/input'

import { useActionState, useState } from 'react'
import { RichTextEditor } from '@/components/portable-text-editor'
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
          <div className="rounded bg-error/10 p-4 text-error">
            {state.error}
          </div>
        )}

        {deleteError && (
          <div className="rounded bg-error/10 p-4 text-error">
            {deleteError}
          </div>
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
          <Input
            className="font-mono"
            defaultValue={work.slug}
            id="slug"
            name="slug"
            pattern="^[a-zA-Z0-9\-_]+$"
            required
            type="text"
          />
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
