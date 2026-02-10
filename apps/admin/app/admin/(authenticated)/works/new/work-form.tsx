'use client'

import { useActionState, useState } from 'react'
import type { ActionState } from './actions'
import { createWork } from './actions'

// Default Portable Text content (empty paragraph)
const DEFAULT_PORTABLE_TEXT =
  '[{"_type":"block","children":[{"_type":"span","marks":[],"text":""}],"markDefs":[],"style":"normal"}]'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

export function WorkForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createWork,
    null
  )
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')

  const handleTitleChange = (value: string) => {
    setTitle(value)
  }

  const handleGenerateSlug = () => {
    if (title) {
      setSlug(generateSlug(title))
    }
  }

  return (
    <div>
      <form action={formAction} className="space-y-6">
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
            id="title"
            maxLength={256}
            name="title"
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="タイトルを入力"
            required
            type="text"
            value={title}
          />
          <p className="mt-1 text-muted text-sm">必須、1〜256文字</p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="slug">
            スラッグ <span className="text-error">*</span>
          </label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              id="slug"
              name="slug"
              onChange={(e) => setSlug(e.target.value)}
              pattern="^[a-z0-9-]+$"
              placeholder="例: my-awesome-project"
              required
              type="text"
              value={slug}
            />
            <button
              className="btn-secondary"
              onClick={handleGenerateSlug}
              type="button"
            >
              自動生成
            </button>
          </div>
          <p className="mt-1 text-muted text-sm">
            必須、URL-safe形式（小文字英数字とハイフン）、一意性制約あり
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="starts_at">
            開始日 <span className="text-error">*</span>
          </label>
          <input
            className="input w-full"
            id="starts_at"
            name="starts_at"
            required
            type="date"
          />
          <p className="mt-1 text-muted text-sm">必須</p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="content">
            コンテンツ <span className="text-error">*</span>
          </label>
          <textarea
            className="input min-h-[200px] w-full resize-y"
            defaultValue={DEFAULT_PORTABLE_TEXT}
            id="content"
            name="content"
            placeholder='Portable Text形式のJSON（例: [{"_type":"block","children":[{"_type":"span","marks":[],"text":"プロジェクトの説明"}],"markDefs":[],"style":"normal"}]）'
            required
          />
          <p className="mt-1 text-muted text-sm">
            必須、Portable Text形式のJSON（初期実装ではテキストエリアで代用）
          </p>
        </div>

        <div className="flex justify-end">
          <button className="btn" disabled={isPending} type="submit">
            {isPending ? '作成中...' : '作成'}
          </button>
        </div>
      </form>
    </div>
  )
}
