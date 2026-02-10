'use client'

import type { Json } from '@ykzts/supabase'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { updateProfile } from './actions'

type ProfileFormProps = {
  initialData?: {
    about: Json | null
    email: string | null
    name: string
    tagline: string | null
  } | null
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateProfile, null)

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
