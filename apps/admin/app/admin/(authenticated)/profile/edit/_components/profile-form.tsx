'use client'

import type { Json } from '@ykzts/supabase'
import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'
import { updateProfile } from '../actions'

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
  }>
  initialTechnologies?: Array<{
    id: string
    name: string
    sort_order: number
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
      url: link.url
    }))
  )

  // Technologies state
  const [technologies, setTechnologies] = useState(
    initialTechnologies.map((tech) => ({ id: tech.id, name: tech.name }))
  )

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { id: '', url: '' }])
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const updateSocialLink = (index: number, value: string) => {
    const updated = [...socialLinks]
    updated[index].url = value
    setSocialLinks(updated)
  }

  const addTechnology = () => {
    setTechnologies([...technologies, { id: '', name: '' }])
  }

  const removeTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index))
  }

  const updateTechnology = (index: number, value: string) => {
    const updated = [...technologies]
    updated[index].name = value
    setTechnologies(updated)
  }

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
        <textarea
          className="input w-full"
          defaultValue={
            initialData?.about
              ? typeof initialData.about === 'string'
                ? initialData.about
                : JSON.stringify(initialData.about)
              : ''
          }
          id="about"
          name="about"
          rows={6}
        />
        <p className="mt-1 text-muted text-sm">
          将来的にPortable Textエディタに対応予定
        </p>
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
        <div className="space-y-3">
          {socialLinks.map((link, index) => (
            <div className="flex gap-2" key={link.id || `new-${index}`}>
              <input
                name={`social_link_id_${index}`}
                type="hidden"
                value={link.id}
              />
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
            </div>
          ))}
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
        <div className="space-y-3">
          {technologies.map((tech, index) => (
            <div className="flex gap-2" key={tech.id || `new-${index}`}>
              <input
                name={`technology_id_${index}`}
                type="hidden"
                value={tech.id}
              />
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
            </div>
          ))}
          <input
            name="technologies_count"
            type="hidden"
            value={technologies.length}
          />
        </div>
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
