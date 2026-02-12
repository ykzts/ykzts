import { Badge } from '@ykzts/ui/components/badge'
import { Button } from '@ykzts/ui/components/button'
import { Card } from '@ykzts/ui/components/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPostById, getPostVersion } from '@/lib/posts'
import { RollbackButton } from './_components/rollback-button'
import { VersionDetailSkeleton } from './_components/version-detail-skeleton'

async function VersionDetailContent({
  postId,
  versionId
}: {
  postId: string
  versionId: string
}) {
  const [post, version] = await Promise.all([
    getPostById(postId),
    getPostVersion(versionId)
  ])

  if (!post || !version) {
    notFound()
  }

  const isCurrent = post.current_version_id === version.id

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-xl">
              バージョン {version.version_number}
            </h2>
            {isCurrent && <Badge variant="default">現在のバージョン</Badge>}
          </div>
          {!isCurrent && (
            <RollbackButton
              postId={postId}
              versionId={versionId}
              versionNumber={version.version_number}
            />
          )}
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="font-medium text-muted-foreground text-sm">
              作成日時
            </dt>
            <dd>{new Date(version.created_at).toLocaleString('ja-JP')}</dd>
          </div>

          <div>
            <dt className="font-medium text-muted-foreground text-sm">
              作成者
            </dt>
            <dd>{version.profile?.name || '不明'}</dd>
          </div>

          {version.change_summary && (
            <div>
              <dt className="font-medium text-muted-foreground text-sm">
                変更内容
              </dt>
              <dd className="rounded bg-muted px-3 py-2">
                {version.change_summary}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-bold text-xl">コンテンツ</h2>

        <dl className="space-y-4">
          {version.title && (
            <>
              <dt className="mb-2 font-medium text-muted-foreground text-sm">
                タイトル
              </dt>
              <dd className="font-medium text-lg">{version.title}</dd>
            </>
          )}

          {version.excerpt && (
            <>
              <dt className="mb-2 font-medium text-muted-foreground text-sm">
                抜粋
              </dt>
              <dd className="text-muted-foreground">{version.excerpt}</dd>
            </>
          )}

          {version.tags && version.tags.length > 0 && (
            <>
              <dt className="mb-2 font-medium text-muted-foreground text-sm">
                タグ
              </dt>
              <dd className="flex flex-wrap gap-2">
                {version.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </dd>
            </>
          )}

          <dt className="mb-2 font-medium text-muted-foreground text-sm">
            本文（JSON）
          </dt>
          <dd>
            <pre className="overflow-auto rounded bg-muted p-4 text-sm">
              {JSON.stringify(version.content, null, 2)}
            </pre>
          </dd>
        </dl>
      </Card>

      <div className="flex justify-between">
        <Button
          render={<Link href={`/posts/${postId}/versions`} />}
          variant="outline"
        >
          履歴に戻る
        </Button>
        <Button render={<Link href={`/posts/${postId}`} />} variant="outline">
          投稿編集
        </Button>
      </div>
    </div>
  )
}

export default async function VersionDetailPage({
  params
}: {
  params: Promise<{ id: string; versionId: string }>
}) {
  const { id, versionId } = await params

  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">バージョン詳細</h1>
      <Suspense fallback={<VersionDetailSkeleton />}>
        <VersionDetailContent postId={id} versionId={versionId} />
      </Suspense>
    </div>
  )
}
