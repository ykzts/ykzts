'use client'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { Alert, AlertDescription } from '@ykzts/ui/components/alert'
import { Button } from '@ykzts/ui/components/button'
import { Field, FieldDescription, FieldLabel } from '@ykzts/ui/components/field'
import { Input } from '@ykzts/ui/components/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@ykzts/ui/components/input-group'
import type { MouseEvent } from 'react'
import { useActionState, useCallback, useState } from 'react'
import { RichTextEditor } from '@/components/portable-text-editor'
import { generateUniqueSlugForWork } from '@/lib/slug'
import { uploadImage } from '@/lib/upload-image'
import { generateSlug } from '@/lib/utils'
import { SortableItem } from './sortable-item'

// Default Portable Text content (empty paragraph)
const DEFAULT_PORTABLE_TEXT =
  '[{"_type":"block","children":[{"_type":"span","marks":[],"text":""}],"markDefs":[],"style":"normal"}]'

export type ActionState = {
  error?: string
  success?: boolean
} | null

type Technology = {
  id: string
  name: string
}

type WorkUrl = {
  id: string
  label: string
  url: string
}

type Work = {
  content: unknown
  created_at: string
  id: string
  slug: string
  starts_at: string
  title: string
  updated_at: string
  work_urls?: Array<{
    id: string
    label: string
    sort_order: number
    url: string
  }>
  work_technologies?: Array<{
    technology_id: string
  }>
}

type WorkFormProps = {
  allTechnologies?: Technology[]
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
  allTechnologies = [],
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

  // Work URLs state
  const [workUrls, setWorkUrls] = useState<WorkUrl[]>(() => {
    if (!work?.work_urls) return []
    return [...work.work_urls]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((u) => ({ id: u.id, label: u.label, url: u.url }))
  })

  // Selected technology IDs state
  const [selectedTechIds, setSelectedTechIds] = useState<Set<string>>(() => {
    if (!work?.work_technologies) return new Set()
    return new Set(work.work_technologies.map((wt) => wt.technology_id))
  })

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const addWorkUrl = () => {
    setWorkUrls([...workUrls, { id: crypto.randomUUID(), label: '', url: '' }])
  }

  const removeWorkUrl = (index: number) => {
    setWorkUrls(workUrls.filter((_, i) => i !== index))
  }

  const updateWorkUrlLabel = (index: number, value: string) => {
    setWorkUrls(
      workUrls.map((u, i) => (i === index ? { ...u, label: value } : u))
    )
  }

  const updateWorkUrlUrl = (index: number, value: string) => {
    setWorkUrls(
      workUrls.map((u, i) => (i === index ? { ...u, url: value } : u))
    )
  }

  const handleWorkUrlsDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setWorkUrls((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        if (oldIndex === -1 || newIndex === -1) {
          return items
        }

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const toggleTechnology = (techId: string) => {
    setSelectedTechIds((prev) => {
      const next = new Set(prev)
      if (next.has(techId)) {
        next.delete(techId)
      } else {
        next.add(techId)
      }
      return next
    })
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
  }

  const handleGenerateSlug = async (e?: MouseEvent<HTMLButtonElement>) => {
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
        }
        setSlug(uniqueSlug)
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
        }
        setSlug(fallbackSlug)
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
      : work.content != null
        ? JSON.stringify(work.content)
        : DEFAULT_PORTABLE_TEXT
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

        {/* Two-column layout: Main content on left, metadata on right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* Title */}
            <Field>
              <FieldLabel htmlFor="title">
                タイトル{' '}
                <span aria-hidden="true" className="text-error">
                  *
                </span>
              </FieldLabel>
              <Input
                defaultValue={work?.title}
                id="title"
                maxLength={256}
                name="title"
                onChange={
                  !isEditMode
                    ? (e) => handleTitleChange(e.target.value)
                    : undefined
                }
                placeholder={!isEditMode ? 'タイトルを入力' : undefined}
                required
                type="text"
                value={!isEditMode ? title : undefined}
              />
              <FieldDescription>
                {isEditMode ? '1〜256文字' : '必須、1〜256文字'}
              </FieldDescription>
            </Field>

            {/* Content */}
            <Field>
              <FieldLabel htmlFor="content">
                コンテンツ{' '}
                <span aria-hidden="true" className="text-error">
                  *
                </span>
              </FieldLabel>
              <RichTextEditor
                id="content"
                initialValue={contentString}
                name="content"
                uploadImage={uploadImage}
              />
            </Field>

            {/* URLs Section */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="block font-medium">URL</div>
                <Button
                  onClick={addWorkUrl}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  + 追加
                </Button>
              </div>
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleWorkUrlsDragEnd}
                sensors={sensors}
              >
                <SortableContext
                  items={workUrls.map((u) => u.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {workUrls.map((workUrl, index) => (
                      <SortableItem id={workUrl.id} key={workUrl.id}>
                        <div className="flex flex-1 flex-col gap-2">
                          <Input
                            aria-label="URLラベル"
                            name={`work_url_label_${index}`}
                            onChange={(e) =>
                              updateWorkUrlLabel(index, e.target.value)
                            }
                            placeholder="ラベル (例: GitHub)"
                            required
                            type="text"
                            value={workUrl.label}
                          />
                          <Input
                            aria-label="URL"
                            name={`work_url_url_${index}`}
                            onChange={(e) =>
                              updateWorkUrlUrl(index, e.target.value)
                            }
                            placeholder="URL (例: https://github.com/example/project)"
                            required
                            type="url"
                            value={workUrl.url}
                          />
                        </div>
                        <Button
                          onClick={() => removeWorkUrl(index)}
                          size="sm"
                          type="button"
                          variant="destructive"
                        >
                          削除
                        </Button>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <input
                name="work_urls_count"
                type="hidden"
                value={workUrls.length}
              />
            </div>

            {/* Technologies Section */}
            {allTechnologies.length > 0 && (
              <div>
                <div className="mb-3 block font-medium">技術タグ</div>
                <div className="flex flex-wrap gap-3">
                  {allTechnologies.map((tech) => {
                    const checked = selectedTechIds.has(tech.id)
                    return (
                      <label
                        className="flex cursor-pointer items-center gap-1.5"
                        key={tech.id}
                      >
                        <input
                          checked={checked}
                          name="work_technology_id"
                          onChange={() => toggleTechnology(tech.id)}
                          type="checkbox"
                          value={tech.id}
                        />
                        <span className="text-sm">{tech.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata Sidebar */}
          <div className="space-y-6">
            {/* Slug */}
            <Field>
              <FieldLabel htmlFor="slug">
                スラッグ{' '}
                <span aria-hidden="true" className="text-error">
                  *
                </span>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  className={isEditMode ? 'font-mono' : ''}
                  defaultValue={work?.slug}
                  id="slug"
                  name="slug"
                  onChange={(e) => setSlug(e.target.value)}
                  pattern={isEditMode ? '^[a-zA-Z0-9\\-_]+$' : '^[a-z0-9-]+$'}
                  placeholder={
                    !isEditMode ? '例: my-awesome-project' : undefined
                  }
                  required
                  type="text"
                  value={!isEditMode ? slug : undefined}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    disabled={isGeneratingSlug || slug.trim() !== ''}
                    onClick={handleGenerateSlug}
                    variant="secondary"
                  >
                    {isGeneratingSlug ? '生成中...' : '自動生成'}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                {isEditMode
                  ? '英数字、ハイフン、アンダースコアのみ使用可能'
                  : '必須、URL-safe形式（小文字英数字とハイフン）、一意性制約あり。自動生成は英数字のみ対応、日本語タイトルの場合は手動でローマ字に変換してください。'}
              </FieldDescription>
            </Field>

            {/* Start Date */}
            <Field>
              <FieldLabel htmlFor="starts_at">
                開始日{' '}
                <span aria-hidden="true" className="text-error">
                  *
                </span>
              </FieldLabel>
              <Input
                defaultValue={work?.starts_at}
                id="starts_at"
                name="starts_at"
                required
                type="date"
              />
              {!isEditMode && <FieldDescription>必須</FieldDescription>}
            </Field>
          </div>
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
