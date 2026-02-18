'use client'
import { Alert, AlertDescription } from '@ykzts/ui/components/alert'
import { Button } from '@ykzts/ui/components/button'
import { Input } from '@ykzts/ui/components/input'
import { useActionState, useState } from 'react'
import { RichTextEditor } from '@/components/portable-text-editor'
import { generateUniqueSlugForWork } from '@/lib/slug'
import { generateSlug } from '@/lib/utils'

// Default Portable Text content (empty paragraph)
const DEFAULT_PORTABLE_TEXT =
  '[{"_type":"block","children":[{"_type":"span","marks":[],"text":""}],"markDefs":[],"style":"normal"}]'

export type ActionState = {
  error?: string
  success?: boolean
} | null

type Work = {
  content: unknown
  created_at: string
  id: string
  slug: string
  starts_at: string
  title: string
  updated_at: string
}

type WorkFormProps = {
  work?: Work
  createAction?: (
    _prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>
  updateAction?: (
    _prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>
  deleteAction?: (id: string) => Promise<void>
}

export function WorkForm({
  work,
  createAction,
  updateAction,
  deleteAction
}: WorkFormProps) {
  const isEditMode = !!work
  const formAction = isEditMode ? updateAction : createAction

  if (!formAction) {
    throw new Error('Either createAction or updateAction must be provided')
  }

  const [state, wrappedFormAction, isPending] = useActionState<
    ActionState,
    FormData
  >(formAction, null)
  const [title, setTitle] = useState(work?.title ?? '')
  const [slug, setSlug] = useState(work?.slug ?? '')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)

  const handleTitleChange = (value: string) => {
    setTitle(value)
  }

  const handleGenerateSlug = async (
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e) {
      e.preventDefault()
    }

    const titleValue = isEditMode
      ? (e?.currentTarget.form?.elements.namedItem('title') as HTMLInputElement)
          ?.value
      : title

    if (titleValue) {
      setIsGeneratingSlug(true)
      try {
        // Use server action to generate unique slug
        const uniqueSlug = await generateUniqueSlugForWork(titleValue, work?.id)
        if (isEditMode && e?.currentTarget.form) {
          const slugInput = e.currentTarget.form.elements.namedItem(
            'slug'
          ) as HTMLInputElement | null
          if (slugInput) {
            slugInput.value = uniqueSlug
          }
        } else {
          setSlug(uniqueSlug)
        }
      } catch (error) {
        // Fallback to client-side generation if server action fails
        console.error('Failed to generate unique slug:', error)
        const fallbackSlug = generateSlug(titleValue)
        if (isEditMode && e?.currentTarget.form) {
          const slugInput = e.currentTarget.form.elements.namedItem(
            'slug'
          ) as HTMLInputElement | null
          if (slugInput) {
            slugInput.value = fallbackSlug
          }
        } else {
          setSlug(fallbackSlug)
        }
      } finally {
        setIsGeneratingSlug(false)
      }
    }
  }

  const handleDelete = async () => {
    if (!work || !deleteAction) return

    if (!confirm('本当にこの作品を削除しますか？この操作は取り消せません。')) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteAction(work.id)
      // If successful, deleteAction will redirect
    } catch (error) {
      setIsDeleting(false)
      setDeleteError(
        error instanceof Error ? error.message : '削除に失敗しました'
      )
    }
  }

  // Convert content to JSON string for editor
  const contentString = work
    ? typeof work.content === 'string'
      ? work.content
      : JSON.stringify(work.content ?? '')
    : DEFAULT_PORTABLE_TEXT

  return (
    <div>
      <form action={wrappedFormAction} className="space-y-6">
        {isEditMode && <input name="id" type="hidden" value={work.id} />}

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
            defaultValue={work?.title}
            id="title"
            maxLength={256}
            name="title"
            onChange={
              !isEditMode ? (e) => handleTitleChange(e.target.value) : undefined
            }
            placeholder={!isEditMode ? 'タイトルを入力' : undefined}
            required
            type="text"
            value={!isEditMode ? title : undefined}
          />
          <p className="mt-1 text-muted-foreground text-sm">
            {isEditMode ? '1〜256文字' : '必須、1〜256文字'}
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="slug">
            スラッグ <span className="text-error">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              className={isEditMode ? 'flex-1 font-mono' : 'flex-1'}
              defaultValue={work?.slug}
              id="slug"
              name="slug"
              onChange={
                !isEditMode ? (e) => setSlug(e.target.value) : undefined
              }
              pattern={isEditMode ? '^[a-zA-Z0-9\\-_]+$' : '^[a-z0-9-]+$'}
              placeholder={!isEditMode ? '例: my-awesome-project' : undefined}
              required
              type="text"
              value={!isEditMode ? slug : undefined}
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
            {isEditMode
              ? '英数字、ハイフン、アンダースコアのみ使用可能'
              : '必須、URL-safe形式（小文字英数字とハイフン）、一意性制約あり。自動生成は英数字のみ対応、日本語タイトルの場合は手動でローマ字に変換してください。'}
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="starts_at">
            開始日 <span className="text-error">*</span>
          </label>
          <Input
            defaultValue={work?.starts_at}
            id="starts_at"
            name="starts_at"
            required
            type="date"
          />
          {!isEditMode && (
            <p className="mt-1 text-muted-foreground text-sm">必須</p>
          )}
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

        <div
          className={
            isEditMode ? 'flex justify-between gap-4' : 'flex justify-end'
          }
        >
          {isEditMode && deleteAction && (
            <Button
              disabled={isPending || isDeleting}
              onClick={handleDelete}
              type="button"
              variant="destructive"
            >
              {isDeleting ? '削除中...' : '削除'}
            </Button>
          )}
          <Button disabled={isPending || isDeleting} type="submit">
            {isPending
              ? isEditMode
                ? '保存中...'
                : '作成中...'
              : isEditMode
                ? '保存'
                : '作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}
