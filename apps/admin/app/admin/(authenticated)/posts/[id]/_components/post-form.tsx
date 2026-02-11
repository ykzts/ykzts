'use client'
import { Button } from '@ykzts/ui/button'
import { Input } from '@ykzts/ui/input'

import { useActionState, useState } from 'react'
import type { ActionState } from '../actions'
import { deletePost, updatePost } from '../actions'

type PostFormProps = {
  post: {
    created_at: string
    id: string
    title: string | null
    updated_at: string
  }
}

export function PostForm({ post }: PostFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updatePost,
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!confirm('本当にこの投稿を削除しますか？この操作は取り消せません。')) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deletePost(post.id)
      // If successful, deletePost will redirect
    } catch (error) {
      setIsDeleting(false)
      setDeleteError(
        error instanceof Error ? error.message : '削除に失敗しました'
      )
    }
  }

  return (
    <div>
      <form action={formAction} className="space-y-6">
        <input name="id" type="hidden" value={post.id} />

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

        <div>
          <label className="mb-2 block font-medium" htmlFor="title">
            タイトル
          </label>
          <input
            className="input w-full"
            defaultValue={post.title ?? ''}
            id="title"
            maxLength={256}
            name="title"
            placeholder="タイトルを入力（任意）"
            type="text"
          />
          <p className="mt-1 text-muted-foreground text-sm">
            任意、256文字以内
          </p>
        </div>

        <div className="flex justify-between gap-4">
          <button
            className="btn-danger"
            disabled={isPending || isDeleting}
            onClick={handleDelete}
            type="button"
          >
            {isDeleting ? '削除中...' : '削除'}
          </button>
          <button
            className="btn"
            disabled={isPending || isDeleting}
            type="submit"
          >
            {isPending ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
