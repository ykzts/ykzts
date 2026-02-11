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
import type { Json } from '@ykzts/supabase'
import { useRouter } from 'next/navigation'
import { useActionState, useCallback, useState } from 'react'
import { RichTextEditor } from '@/components/portable-text-editor'
import { updateProfile } from '../actions'
import { SortableItem } from './sortable-item'

type ProfileFormProps = {
  initialData?: {
    about: Json | null
    email: string | null
    name: string
    tagline: string | null
  } | null
  initialSocialLinks?: Array<{
    id: string
    service: string | null
    sort_order: number
    url: string
    isNew?: boolean
  }>
  initialTechnologies?: Array<{
    id: string
    name: string
    sort_order: number
    isNew?: boolean
  }>
}

export default function ProfileForm({
  initialData,
  initialSocialLinks = [],
  initialTechnologies = []
}: ProfileFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateProfile, null)

  // Social links state
  const [socialLinks, setSocialLinks] = useState(
    initialSocialLinks.map((link) => ({
      id: link.id,
      isNew: link.isNew,
      url: link.url
    }))
  )

  // Technologies state
  const [technologies, setTechnologies] = useState(
    initialTechnologies.map((tech) => ({
      id: tech.id,
      isNew: tech.isNew,
      name: tech.name
    }))
  )

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const addSocialLink = () => {
    setSocialLinks([
      ...socialLinks,
      { id: crypto.randomUUID(), isNew: true, url: '' }
    ])
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const updateSocialLink = (index: number, value: string) => {
    setSocialLinks(
      socialLinks.map((link, i) =>
        i === index ? { ...link, url: value } : link
      )
    )
  }

  const addTechnology = () => {
    setTechnologies([
      ...technologies,
      { id: crypto.randomUUID(), isNew: true, name: '' }
    ])
  }

  const removeTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index))
  }

  const updateTechnology = (index: number, value: string) => {
    setTechnologies(
      technologies.map((tech, i) =>
        i === index ? { ...tech, name: value } : tech
      )
    )
  }

  // Memoized drag handler for social links
  const handleSocialLinksDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSocialLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        // Defensive check: ensure both indices are valid
        if (oldIndex === -1 || newIndex === -1) {
          return items
        }

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  // Memoized drag handler for technologies
  const handleTechnologiesDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTechnologies((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        // Defensive check: ensure both indices are valid
        if (oldIndex === -1 || newIndex === -1) {
          return items
        }

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded border border-error bg-error/10 p-4 text-error">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-2 block font-medium" htmlFor="name">
          名前 <span className="text-error">*</span>
        </label>
        <input
          className="input w-full"
          defaultValue={initialData?.name ?? ''}
          id="name"
          name="name"
          required
          type="text"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium" htmlFor="tagline">
          キャッチコピー
        </label>
        <input
          className="input w-full"
          defaultValue={initialData?.tagline ?? ''}
          id="tagline"
          name="tagline"
          type="text"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium" htmlFor="email">
          メールアドレス
        </label>
        <input
          className="input w-full"
          defaultValue={initialData?.email ?? ''}
          id="email"
          name="email"
          type="email"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium" htmlFor="about">
          自己紹介
        </label>
        <RichTextEditor
          id="about"
          initialValue={
            initialData?.about
              ? typeof initialData.about === 'string'
                ? initialData.about
                : JSON.stringify(initialData.about)
              : undefined
          }
          name="about"
        />
      </div>

      {/* Social Links Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="block font-medium">ソーシャルリンク</div>
          <button
            className="btn-secondary text-sm"
            onClick={addSocialLink}
            type="button"
          >
            + 追加
          </button>
        </div>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleSocialLinksDragEnd}
          sensors={sensors}
        >
          <SortableContext
            items={socialLinks.map((link) => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <SortableItem id={link.id} key={link.id}>
                  {!link.isNew && (
                    <input
                      name={`social_link_id_${index}`}
                      type="hidden"
                      value={link.id}
                    />
                  )}
                  <input
                    className="input flex-1"
                    name={`social_link_url_${index}`}
                    onChange={(e) => updateSocialLink(index, e.target.value)}
                    placeholder="URL (例: https://github.com/username)"
                    required
                    type="url"
                    value={link.url}
                  />
                  <button
                    className="btn-danger"
                    onClick={() => removeSocialLink(index)}
                    type="button"
                  >
                    削除
                  </button>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <input
          name="social_links_count"
          type="hidden"
          value={socialLinks.length}
        />
        <p className="mt-2 text-muted text-sm">
          URLから自動的にサービスを検出します (GitHub, X, Facebook, Mastodon
          など)
        </p>
      </div>

      {/* Technologies Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="block font-medium">技術タグ</div>
          <button
            className="btn-secondary text-sm"
            onClick={addTechnology}
            type="button"
          >
            + 追加
          </button>
        </div>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleTechnologiesDragEnd}
          sensors={sensors}
        >
          <SortableContext
            items={technologies.map((tech) => tech.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {technologies.map((tech, index) => (
                <SortableItem id={tech.id} key={tech.id}>
                  {!tech.isNew && (
                    <input
                      name={`technology_id_${index}`}
                      type="hidden"
                      value={tech.id}
                    />
                  )}
                  <input
                    className="input flex-1"
                    name={`technology_name_${index}`}
                    onChange={(e) => updateTechnology(index, e.target.value)}
                    placeholder="技術名 (例: TypeScript)"
                    type="text"
                    value={tech.name}
                  />
                  <button
                    className="btn-danger"
                    onClick={() => removeTechnology(index)}
                    type="button"
                  >
                    削除
                  </button>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <input
          name="technologies_count"
          type="hidden"
          value={technologies.length}
        />
      </div>

      <div className="flex gap-4">
        <button className="btn" disabled={isPending} type="submit">
          {isPending ? '保存中...' : '保存'}
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            router.push('/admin/profile')
          }}
          type="button"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
