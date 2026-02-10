'use client'

import { useActionState } from 'react'
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

  const handleDelete = async () => {
    if (!confirm('本当にこの作品を削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      await deleteWork(work.id)
    } catch (error) {
      alert(
        `削除に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      )
    }
  }

  // Convert content to JSON string for textarea
  const contentString = JSON.stringify(work.content, null, 2)

  return (
    <div>
      <form action={formAction} className="space-y-6">
        <input name="id" type="hidden" value={work.id} />

        {state?.error && (
          <div className="rounded bg-error/10 p-4 text-error">
            {state.error}
          </div>
        )}

        <div>
          <label className="mb-2 block font-medium" htmlFor="title">
            タイトル <span className="text-error">*</span>
          </label>
          <input
            className="input w-full"
            defaultValue={work.title}
            id="title"
            maxLength={256}
            name="title"
            required
            type="text"
          />
          <p className="mt-1 text-muted text-sm">1〜256文字</p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="slug">
            スラッグ <span className="text-error">*</span>
          </label>
          <input
            className="input w-full font-mono"
            defaultValue={work.slug}
            id="slug"
            name="slug"
            pattern="^[a-zA-Z0-9\-_]+$"
            required
            type="text"
          />
          <p className="mt-1 text-muted text-sm">
            英数字、ハイフン、アンダースコアのみ使用可能
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="starts_at">
            開始日 <span className="text-error">*</span>
          </label>
          <input
            className="input w-full"
            defaultValue={work.starts_at}
            id="starts_at"
            name="starts_at"
            required
            type="date"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="content">
            コンテンツ (JSON) <span className="text-error">*</span>
          </label>
          <textarea
            className="input min-h-[300px] w-full font-mono text-sm"
            defaultValue={contentString}
            id="content"
            name="content"
            required
          />
          <p className="mt-1 text-muted text-sm">
            Portable Text形式のJSON（将来的にエディタに置き換え予定）
          </p>
        </div>

        <div className="flex justify-between gap-4">
          <button
            className="btn-danger"
            disabled={isPending}
            onClick={handleDelete}
            type="button"
          >
            削除
          </button>
          <button className="btn" disabled={isPending} type="submit">
            {isPending ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
