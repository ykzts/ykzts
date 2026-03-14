import type { PortableTextBlock } from '@portabletext/types'
import { extractFirstParagraph } from '@ykzts/portable-text-utils'
import { getSiteOrigin } from '@ykzts/site-config'
import { createServerClient } from '@ykzts/supabase/server'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/header'
import MemoPortableText from '@/components/portable-text'
import { getOwnerProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

type Props = {
  params: Promise<{ path: string[] }>
}

function isPortableTextValue(value: unknown): value is PortableTextBlock[] {
  if (!Array.isArray(value)) {
    return false
  }
  return value.every((item) => {
    if (!item || typeof item !== 'object') {
      return false
    }
    return typeof (item as { _type?: unknown })._type === 'string'
  })
}

function extractCurrentVersion<T>(
  currentVersion: T | T[] | null | undefined
): T | null {
  if (Array.isArray(currentVersion)) {
    return currentVersion[0] ?? null
  }
  return currentVersion ?? null
}

export async function generateStaticParams() {
  if (!supabase) {
    // Return placeholder when Supabase is not configured (e.g., during build without env vars)
    // Cache Components requires at least one result from generateStaticParams
    return [{ path: ['_placeholder'] }]
  }

  const { data: memos, error } = await supabase
    .from('memos')
    .select('path')
    .eq('visibility', 'public')

  if (error) {
    throw new Error(
      `Failed to fetch memos for static generation: ${error.message}`
    )
  }

  if (memos.length === 0) {
    // Cache Components requires at least one result from generateStaticParams
    return [{ path: ['_placeholder'] }]
  }

  // Include memo paths and all prefix paths (for index pages)
  const pathSet = new Set<string>()
  for (const memo of memos) {
    pathSet.add(memo.path)
    const segments = memo.path.split('/')
    for (let i = 1; i < segments.length; i++) {
      pathSet.add(segments.slice(0, i).join('/'))
    }
  }

  return Array.from(pathSet).map((p) => ({ path: p.split('/') }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params
  const memoPath = path.join('/')

  if (!isSupabaseConfigured()) {
    return { title: 'Not Found' }
  }

  const siteOrigin = getSiteOrigin()
  const supabase = await createServerClient()

  const { data: memo, error: memoError } = await supabase
    .from('memos')
    .select(
      'path, visibility, published_at, updated_at, current_version:memo_versions!memos_current_version_id_fkey(id, title, content)'
    )
    .eq('path', memoPath)
    .eq('visibility', 'public')
    .maybeSingle()

  if (memoError) {
    throw new Error(`Failed to fetch memo metadata: ${memoError.message}`)
  }

  if (!memo) {
    // Check if there are child memos (index page)
    const { data: children, error: childError } = await supabase
      .from('memos')
      .select('id')
      .eq('visibility', 'public')
      .like('path', `${memoPath}/%`)
      .limit(1)

    if (childError) {
      throw new Error(`Failed to fetch child memos: ${childError.message}`)
    }

    if (!children || children.length === 0) {
      return { title: 'Not Found' }
    }

    return {
      alternates: { canonical: new URL(`/${memoPath}`, siteOrigin).toString() },
      title: memoPath
    }
  }

  const currentVersion = extractCurrentVersion(memo.current_version)
  const title = currentVersion?.title ?? memo.path
  const content = isPortableTextValue(currentVersion?.content)
    ? currentVersion.content
    : null
  const description = extractFirstParagraph(content) || undefined
  const canonicalUrl = new URL(`/${memoPath}`, siteOrigin).toString()

  return {
    alternates: { canonical: canonicalUrl },
    description,
    openGraph: {
      description,
      modifiedTime: memo.updated_at,
      publishedTime: memo.published_at ?? undefined,
      title,
      type: 'article',
      url: canonicalUrl
    },
    title
  }
}

async function getMemo(memoPath: string, isDraftMode: boolean) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null }
  }

  const supabase = await createServerClient()

  let query = supabase
    .from('memos')
    .select(
      'id, path, visibility, profile_id, published_at, updated_at, current_version:memo_versions!memos_current_version_id_fkey(id, title, content)'
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

async function getChildMemos(pathPrefix: string, isDraftMode: boolean) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null }
  }

  const supabase = await createServerClient()

  let query = supabase
    .from('memos')
    .select(
      'id, path, visibility, current_version:memo_versions!memos_current_version_id_fkey(id, title)'
    )
    .like('path', `${pathPrefix}/%`)
    .order('path', { ascending: true })

  if (!isDraftMode) {
    query = query.eq('visibility', 'public')
  }

  const { data, error } = await query

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
    // Check for child memos (index page)
    const { data: children, error: childError } = await getChildMemos(
      memoPath,
      isDraftMode
    )

    if (childError) {
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

    if (!children || children.length === 0) {
      notFound()
    }

    const canEdit = Boolean(ownerProfile)

    return (
      <>
        <Header canEdit={canEdit} />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="mb-2 font-bold text-3xl">
            /{memoPath.split('/').at(-1) ?? memoPath}
          </h1>
          <p className="mb-6 text-muted-foreground text-sm">/{memoPath}</p>
          <ul className="space-y-2">
            {children.map((child) => {
              const version = extractCurrentVersion(child.current_version)
              const title = version?.title ?? child.path
              return (
                <li key={child.id}>
                  <Link
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                    href={`/${child.path}`}
                  >
                    <span className="flex-1 font-medium">{title}</span>
                    <span className="text-muted-foreground text-sm">
                      /{child.path}
                    </span>
                    {child.visibility === 'private' && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                        非公開
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </main>
      </>
    )
  }

  // Edit permission: user must be authenticated and own the memo
  const canEdit = Boolean(ownerProfile && memo.profile_id === ownerProfile.id)

  const currentVersion = extractCurrentVersion(memo.current_version)
  const title = currentVersion?.title ?? memo.path
  const content = isPortableTextValue(currentVersion?.content)
    ? currentVersion.content
    : null

  const dateOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Tokyo' }

  return (
    <>
      <Header canEdit={canEdit} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-bold text-3xl">{title}</h1>
            <p className="mt-1 text-muted-foreground text-sm">/{memo.path}</p>
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

        {content ? (
          <MemoPortableText value={content} />
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
