import {
  extractFirstParagraph,
  portableTextToHTML
} from '@ykzts/portable-text-utils'
import { getSiteOrigin } from '@ykzts/site-config'
import { createBrowserClient } from '@ykzts/supabase/client'
import { createServerClient } from '@ykzts/supabase/server'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/header'
import { getOwnerProfile } from '@/lib/auth'

type Props = {
  params: Promise<{ path: string[] }>
}

const PLACEHOLDER_PATH = '_placeholder'

type PortableTextContent = Exclude<
  Parameters<typeof portableTextToHTML>[0],
  null | undefined
>

function isPortableTextValue(value: unknown): value is PortableTextContent {
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

export async function generateStaticParams() {
  let supabase: ReturnType<typeof createBrowserClient>
  try {
    supabase = createBrowserClient()
  } catch {
    return [{ path: [PLACEHOLDER_PATH] }]
  }

  const { data: memos } = await supabase
    .from('memos')
    .select('path')
    .eq('visibility', 'public')

  if (!memos || memos.length === 0) {
    return [{ path: [PLACEHOLDER_PATH] }]
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

  if (memoPath === PLACEHOLDER_PATH) {
    return { title: 'Not Found' }
  }

  const siteOrigin = getSiteOrigin()
  const supabase = await createServerClient()

  const { data: memo } = await supabase
    .from('memos')
    .select(
      'path, visibility, published_at, updated_at, current_version_id, memo_versions(id, title, content)'
    )
    .eq('path', memoPath)
    .eq('visibility', 'public')
    .maybeSingle()

  if (!memo) {
    // Check if there are child memos (index page)
    const { data: children } = await supabase
      .from('memos')
      .select('id')
      .eq('visibility', 'public')
      .like('path', `${memoPath}/%`)
      .limit(1)

    if (!children || children.length === 0) {
      return { title: 'Not Found' }
    }

    return {
      alternates: { canonical: new URL(`/${memoPath}`, siteOrigin).toString() },
      title: memoPath
    }
  }

  const versions = Array.isArray(memo.memo_versions) ? memo.memo_versions : []
  const currentVersion = memo.current_version_id
    ? (versions.find((v) => v.id === memo.current_version_id) ?? versions[0])
    : versions[0]

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

async function getChildMemos(pathPrefix: string, isDraftMode: boolean) {
  const supabase = await createServerClient()

  let query = supabase
    .from('memos')
    .select(
      'id, path, visibility, current_version_id, memo_versions(id, title)'
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

  if (memoPath === PLACEHOLDER_PATH) {
    notFound()
  }

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

    if (childError || !children || children.length === 0) {
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
              const versions = Array.isArray(child.memo_versions)
                ? child.memo_versions
                : []
              const version =
                versions.find((v) => v.id === child.current_version_id) ??
                versions[0]
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

  // Get the current version
  const versions = Array.isArray(memo.memo_versions) ? memo.memo_versions : []
  const currentVersion = memo.current_version_id
    ? (versions.find((v) => v.id === memo.current_version_id) ?? versions[0])
    : versions[0]

  const title = currentVersion?.title ?? memo.path
  const content = isPortableTextValue(currentVersion?.content)
    ? currentVersion.content
    : null
  const contentHtml = portableTextToHTML(content)

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

        {contentHtml ? (
          <div
            className="prose max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized server-side from PortableText
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
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
