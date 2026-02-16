'use client'
import { Alert, AlertDescription } from '@ykzts/ui/components/alert'
import { Button } from '@ykzts/ui/components/button'
import { Input } from '@ykzts/ui/components/input'

import { useActionState, useState } from 'react'
import { RichTextEditor } from '@/components/portable-text-editor'
import { generateUniqueSlugForWork } from '@/lib/slug'
import { generateSlug } from '@/lib/utils'
import type { ActionState } from '../actions'
import { createWork } from '../actions'

// Default Portable Text content (empty paragraph)
const DEFAULT_PORTABLE_TEXT =
  '[{"_type":"block","children":[{"_type":"span","marks":[],"text":""}],"markDefs":[],"style":"normal"}]'

export function WorkForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createWork,
    null
  )
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)

  const handleTitleChange = (value: string) => {
    setTitle(value)
  }

  const handleGenerateSlug = async () => {
    if (title) {
      setIsGeneratingSlug(true)
      try {
        // Use server action to generate unique slug
        const uniqueSlug = await generateUniqueSlugForWork(title)
        setSlug(uniqueSlug)
      } catch (error) {
        // Fallback to client-side generation if server action fails
        console.error('Failed to generate unique slug:', error)
        setSlug(generateSlug(title))
      } finally {
        setIsGeneratingSlug(false)
      }
    }
  }

  return (
    <div>
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <div>
          <label className="mb-2 block font-medium" htmlFor="title">
            タイトル <span className="text-error">*</span>
          </label>
          <Input
            id="title"
            maxLength={256}
            name="title"
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="タイトルを入力"
            required
            type="text"
            value={title}
          />
          <p className="mt-1 text-muted-foreground text-sm">必須、1〜256文字</p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="slug">
            スラッグ <span className="text-error">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              className="flex-1"
              id="slug"
              name="slug"
              onChange={(e) => setSlug(e.target.value)}
              pattern="^[a-z0-9-]+$"
              placeholder="例: my-awesome-project"
              required
              type="text"
              value={slug}
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
            必須、URL-safe形式（小文字英数字とハイフン）、一意性制約あり。自動生成は英数字のみ対応、日本語タイトルの場合は手動でローマ字に変換してください。
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="starts_at">
            開始日 <span className="text-error">*</span>
          </label>
          <Input id="starts_at" name="starts_at" required type="date" />
          <p className="mt-1 text-muted-foreground text-sm">必須</p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="content">
            コンテンツ <span className="text-error">*</span>
          </label>
          <RichTextEditor
            id="content"
            initialValue={DEFAULT_PORTABLE_TEXT}
            name="content"
          />
        </div>

        <div className="flex justify-end">
          <Button disabled={isPending} type="submit">
            {isPending ? '作成中...' : '作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}
