'use client'

import { useState } from 'react'
import { login } from './actions'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      await login(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-error/10 border border-error text-error rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">
          メールアドレス
        </label>
        <input
          className="input w-full"
          disabled={loading}
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password">
          パスワード
        </label>
        <input
          className="input w-full"
          disabled={loading}
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      <button className="btn w-full" disabled={loading} type="submit">
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  )
}
