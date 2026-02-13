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
import { Button } from '@ykzts/ui/components/button'
import { Input } from '@ykzts/ui/components/input'
import { useRouter } from 'next/navigation'
import { useActionState, useCallback, useState } from 'react'
import { RichTextEditor } from '@/components/portable-text-editor'
import { getCommonTimezones } from '@/lib/timezones'
import { updateProfile } from '../actions'
import { SortableItem } from './sortable-item'

type ProfileFormProps = {
  initialData?: {
    about: Json | null
    email: string | null
    name: string
    tagline: string | null
    timezone: string
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
        <Input
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
        <Input
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
        <Input
          defaultValue={initialData?.email ?? ''}
          id="email"
          name="email"
          type="email"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium" htmlFor="timezone">
          タイムゾーン
        </label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          defaultValue={initialData?.timezone ?? 'Asia/Tokyo'}
          id="timezone"
          name="timezone"
        >
          {getCommonTimezones().map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-muted-foreground text-sm">
          日時の表示に使用するタイムゾーンを選択してください
        </p>
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
          <Button
            onClick={addSocialLink}
            size="sm"
            type="button"
            variant="secondary"
          >
            + 追加
          </Button>
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
                  <Input
                    aria-label="ソーシャルリンクURL"
                    className="flex-1"
                    name={`social_link_url_${index}`}
                    onChange={(e) => updateSocialLink(index, e.target.value)}
                    placeholder="URL (例: https://github.com/username)"
                    required
                    type="url"
                    value={link.url}
                  />
                  <Button
                    onClick={() => removeSocialLink(index)}
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
          name="social_links_count"
          type="hidden"
          value={socialLinks.length}
        />
        <p className="mt-2 text-muted-foreground text-sm">
          URLから自動的にサービスを検出します (GitHub, X, Facebook, Mastodon
          など)
        </p>
      </div>

      {/* Technologies Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="block font-medium">技術タグ</div>
          <Button
            onClick={addTechnology}
            size="sm"
            type="button"
            variant="secondary"
          >
            + 追加
          </Button>
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
                  <Input
                    aria-label="技術名"
                    className="flex-1"
                    name={`technology_name_${index}`}
                    onChange={(e) => updateTechnology(index, e.target.value)}
                    placeholder="技術名 (例: TypeScript)"
                    required
                    type="text"
                    value={tech.name}
                  />
                  <Button
                    onClick={() => removeTechnology(index)}
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
          name="technologies_count"
          type="hidden"
          value={technologies.length}
        />
      </div>

      <div className="flex gap-4">
        <Button disabled={isPending} type="submit">
          {isPending ? '保存中...' : '保存'}
        </Button>
        <Button
          onClick={() => {
            router.push('/profile')
          }}
          type="button"
          variant="secondary"
        >
          キャンセル
        </Button>
      </div>
    </form>
  )
}
