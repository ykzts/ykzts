'use client'

import type { PortableTextBlock } from '@portabletext/types'
import { useActionState, useEffect, useState } from 'react'
import { updateMemo } from '@/app/[...path]/actions'
import MemoPortableText from '@/components/portable-text'
import { RichTextEditor } from '@/components/portable-text-editor'

type Props = {
  content: PortableTextBlock[] | null
  memoId: string
  memoPath: string
  title: string
  visibility: string
}

export function InlineMemoEditor({
  content,
  memoId,
  memoPath,
  title,
  visibility
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateMemo, null)

  useEffect(() => {
    if (state?.success) {
      setIsEditing(false)
    }
  }, [state])

  if (!isEditing) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <button
            className="rounded bg-primary px-3 py-1.5 text-primary-foreground text-sm hover:bg-primary/90"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            編集
          </button>
        </div>
        {content ? (
          <MemoPortableText value={content} />
        ) : (
          <p className="text-muted-foreground">コンテンツがありません。</p>
        )}
      </div>
    )
  }

  const initialContent = content ? JSON.stringify(content) : undefined

  return (
    <form action={formAction}>
      <input name="memoId" type="hidden" value={memoId} />
      <input name="memoPath" type="hidden" value={memoPath} />

      <div className="mb-4">
        <label className="mb-1 block font-medium text-sm" htmlFor="memo-title">
          タイトル
        </label>
        <input
          className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue={title}
          id="memo-title"
          name="title"
          required
          type="text"
        />
      </div>

      <div className="mb-4">
        <label
          className="mb-1 block font-medium text-sm"
          htmlFor="memo-content"
        >
          コンテンツ
        </label>
        <RichTextEditor
          id="memo-content"
          initialValue={initialContent}
          name="content"
          placeholder="メモの内容を入力してください..."
        />
      </div>

      <div className="mb-4">
        <label
          className="mb-1 block font-medium text-sm"
          htmlFor="memo-visibility"
        >
          公開設定
        </label>
        <select
          className="rounded border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue={visibility}
          id="memo-visibility"
          name="visibility"
        >
          <option value="public">公開</option>
          <option value="private">非公開</option>
        </select>
      </div>

      {state?.error && (
        <p className="mb-4 rounded bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          className="rounded border border-border px-4 py-2 text-sm hover:bg-muted/20"
          disabled={isPending}
          onClick={() => setIsEditing(false)}
          type="button"
        >
          キャンセル
        </button>
        <button
          className="rounded bg-primary px-4 py-2 text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}
