import { createServerClient } from '@ykzts/supabase/server'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'
import { getCurrentUser, getOwnerProfile } from '@/lib/auth'
import { logout } from './login/actions'

async function MemoList() {
  const { isEnabled: isDraftMode } = await draftMode()
  const ownerProfile = await getOwnerProfile()

  const supabase = await createServerClient()

  let query = supabase
    .from('memos')
    .select(
      'id, path, visibility, published_at, updated_at, memo_versions(title)'
    )
    .order('updated_at', { ascending: false })

  if (!isDraftMode || !ownerProfile) {
    // Public access: only show public memos
    query = query.eq('visibility', 'public')
  }

  const { data: memos, error } = await query

  if (error) {
    return (
      <p className="text-muted-foreground">メモの読み込みに失敗しました。</p>
    )
  }

  if (!memos || memos.length === 0) {
    return <p className="text-muted-foreground">メモがありません。</p>
  }

  return (
    <ul className="space-y-2">
      {memos.map((memo) => {
        const version = Array.isArray(memo.memo_versions)
          ? memo.memo_versions[0]
          : memo.memo_versions
        const title = version?.title ?? memo.path
        return (
          <li key={memo.id}>
            <Link
              className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
              href={`/${memo.path}`}
            >
              <span className="flex-1 font-medium">{title}</span>
              {memo.visibility === 'private' && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                  非公開
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="border-border border-b bg-background">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link className="font-bold text-xl" href="/">
          Memo
        </Link>
        <nav>
          {user ? (
            <form action={logout}>
              <button
                className="text-muted-foreground text-sm hover:text-foreground"
                type="submit"
              >
                ログアウト
              </button>
            </form>
          ) : (
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/login"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 font-bold text-2xl">メモ一覧</h1>
        <Suspense
          fallback={
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  className="h-10 animate-pulse rounded-md bg-muted"
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader uses index
                  key={i}
                />
              ))}
            </div>
          }
        >
          <MemoList />
        </Suspense>
      </main>
    </div>
  )
}
