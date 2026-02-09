'use client'

import { useActionState } from 'react'
import { login } from './actions'

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<
    { error?: string } | null,
    FormData
  >(
    async (_prevState, formData) => {
      try {
        await login(formData)
        return null
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : 'ログインに失敗しました'
        }
      }
    },
    null
  )

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded border border-error bg-error/10 p-3 text-error">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-1 block font-medium text-sm" htmlFor="email">
          メールアドレス
        </label>
        <input
          className="input w-full"
          disabled={isPending}
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium text-sm" htmlFor="password">
          パスワード
        </label>
        <input
          className="input w-full"
          disabled={isPending}
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      <button className="btn w-full" disabled={isPending} type="submit">
        {isPending ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  )
}
