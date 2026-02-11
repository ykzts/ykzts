import { Badge } from '@ykzts/ui/components/badge'
import { Button } from '@ykzts/ui/components/button'
import { Card } from '@ykzts/ui/components/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { compareVersions, getPostById } from '@/lib/posts'
import { CompareSkeleton } from './_components/compare-skeleton'

function DiffItem({
  label,
  oldValue,
  newValue
}: {
  label: string
  newValue?: string | string[] | null
  oldValue?: string | string[] | null
}) {
  const oldStr = Array.isArray(oldValue) ? oldValue.join(', ') : oldValue || ''
  const newStr = Array.isArray(newValue) ? newValue.join(', ') : newValue || ''

  if (oldStr === newStr) {
    return (
      <div className="rounded border border-border p-3">
        <div className="mb-2 font-medium text-muted-foreground text-sm">
          {label}
        </div>
        <div className="text-sm">{newStr || '(空)'}</div>
      </div>
    )
  }

  return (
    <div className="rounded border border-border p-3">
      <div className="mb-2 font-medium text-muted-foreground text-sm">
        {label}
      </div>
      <div className="space-y-2">
        <div className="rounded bg-red-50 p-2 dark:bg-red-950/20">
          <div className="mb-1 flex items-center gap-1 font-medium text-red-600 text-xs dark:text-red-400">
            <span>− 古いバージョン</span>
          </div>
          <div className="text-red-900 text-sm dark:text-red-100">
            {oldStr || '(空)'}
          </div>
        </div>
        <div className="rounded bg-green-50 p-2 dark:bg-green-950/20">
          <div className="mb-1 flex items-center gap-1 font-medium text-green-600 text-xs dark:text-green-400">
            <span>+ 新しいバージョン</span>
          </div>
          <div className="text-green-900 text-sm dark:text-green-100">
            {newStr || '(空)'}
          </div>
        </div>
      </div>
    </div>
  )
}

async function CompareContent({
  fromId,
  postId,
  toId
}: {
  fromId: string
  postId: string
  toId: string
}) {
  const [post, comparison] = await Promise.all([
    getPostById(postId),
    compareVersions(fromId, toId, postId)
  ])

  if (!post || !comparison.version1 || !comparison.version2) {
    notFound()
  }

  const { version1, version2 } = comparison

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl">バージョン比較</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              v{version1.version_number} → v{version2.version_number}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-bold text-lg">メタデータの変更</h3>
        <div className="space-y-4">
          <DiffItem
            label="タイトル"
            newValue={version2.title}
            oldValue={version1.title}
          />
          <DiffItem
            label="抜粋"
            newValue={version2.excerpt}
            oldValue={version1.excerpt}
          />
          <DiffItem
            label="タグ"
            newValue={version2.tags}
            oldValue={version1.tags}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-bold text-lg">変更サマリー</h3>
        <div className="space-y-3">
          {version1.change_summary && (
            <div>
              <div className="mb-1 font-medium text-muted-foreground text-sm">
                v{version1.version_number}
              </div>
              <div className="rounded bg-muted px-3 py-2 text-sm">
                {version1.change_summary}
              </div>
            </div>
          )}
          {version2.change_summary && (
            <div>
              <div className="mb-1 font-medium text-muted-foreground text-sm">
                v{version2.version_number}
              </div>
              <div className="rounded bg-muted px-3 py-2 text-sm">
                {version2.change_summary}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-bold text-lg">コンテンツの変更</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary">v{version1.version_number}</Badge>
              <span className="font-medium text-sm">古いバージョン</span>
            </div>
            <pre className="overflow-auto rounded bg-red-50 p-4 text-xs dark:bg-red-950/20">
              {JSON.stringify(version1.content, null, 2)}
            </pre>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="default">v{version2.version_number}</Badge>
              <span className="font-medium text-sm">新しいバージョン</span>
            </div>
            <pre className="overflow-auto rounded bg-green-50 p-4 text-xs dark:bg-green-950/20">
              {JSON.stringify(version2.content, null, 2)}
            </pre>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          render={<Link href={`/admin/posts/${postId}/versions`} />}
          variant="outline"
        >
          履歴に戻る
        </Button>
        <Button
          render={<Link href={`/admin/posts/${postId}`} />}
          variant="outline"
        >
          投稿編集
        </Button>
      </div>
    </div>
  )
}

export default function ComparePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">バージョン比較</h1>
      <Suspense fallback={<CompareSkeleton />}>
        <ComparePageContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function ComparePageContent({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { id } = await params
  const { from, to } = await searchParams

  if (!from || !to) {
    return (
      <div>
        <Card className="p-6">
          <p className="text-error">比較するバージョンが指定されていません</p>
          <Button
            className="mt-4"
            render={<Link href={`/admin/posts/${id}/versions`} />}
            variant="outline"
          >
            履歴に戻る
          </Button>
        </Card>
      </div>
    )
  }

  return <CompareContent fromId={from} postId={id} toId={to} />
}
