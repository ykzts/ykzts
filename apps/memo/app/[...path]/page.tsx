import { createServerClient } from '@ykzts/supabase/server'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/header'
import { getOwnerProfile } from '@/lib/auth'

type Props = {
  params: Promise<{ path: string[] }>
}

async function getMemo(memoPath: string, isDraftMode: boolean) {
  const supabase = await createServerClient()

  let query = supabase
    .from('memos')
    .select(
      'id, path, visibility, profile_id, published_at, updated_at, current_version_id, memo_versions(id, title, content, created_at)'
    )
    .eq('path', memoPath)

  if (!isDraftMode) {
    query = query.eq('visibility', 'public')
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

async function MemoContent({ path: memoPath }: { path: string }) {
  const { isEnabled: isDraftMode } = await draftMode()
  const ownerProfile = await getOwnerProfile()

  const { data: memo, error } = await getMemo(memoPath, isDraftMode)

  if (error) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-muted-foreground">
            メモの読み込みに失敗しました。
          </p>
        </main>
      </>
    )
  }

  if (!memo) {
    notFound()
  }

  // Edit permission: user must be authenticated and own the memo
  const canEdit = Boolean(ownerProfile && memo.profile_id === ownerProfile.id)

  // Get the current version
  const versions = Array.isArray(memo.memo_versions) ? memo.memo_versions : []
  const currentVersion = memo.current_version_id
    ? (versions.find((v) => v.id === memo.current_version_id) ?? versions[0])
    : versions[0]

  const title = currentVersion?.title ?? memo.path

  const dateOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Tokyo' }

  return (
    <>
      <Header canEdit={canEdit} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-bold text-3xl">{title}</h1>
            {memo.visibility === 'private' && (
              <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                非公開
              </span>
            )}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <span className="text-muted-foreground text-sm">
                ✓ 編集権限あり
              </span>
            </div>
          )}
        </div>

        {currentVersion ? (
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
              {JSON.stringify(currentVersion.content, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-muted-foreground">コンテンツがありません。</p>
        )}

        <div className="mt-8 border-border border-t pt-4 text-muted-foreground text-sm">
          <p>
            更新日時:{' '}
            {new Date(memo.updated_at).toLocaleString('ja-JP', dateOptions)}
          </p>
          {memo.published_at && (
            <p>
              公開日時:{' '}
              {new Date(memo.published_at).toLocaleString('ja-JP', dateOptions)}
            </p>
          )}
        </div>
      </main>
    </>
  )
}

export default async function MemoPage({ params }: Props) {
  const { path } = await params
  const memoPath = path.join('/')

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <MemoContent path={memoPath} />
      </Suspense>
    </div>
  )
}
