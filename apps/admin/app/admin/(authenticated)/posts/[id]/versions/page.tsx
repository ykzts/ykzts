import { Badge } from '@ykzts/ui/components/badge'
import { Button } from '@ykzts/ui/components/button'
import { Card } from '@ykzts/ui/components/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPostById, getPostVersions } from '@/lib/posts'
import { VersionsSkeleton } from './_components/versions-skeleton'

async function VersionsContent({ postId }: { postId: string }) {
  const [post, versions] = await Promise.all([
    getPostById(postId),
    getPostVersions(postId)
  ])

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-4 font-bold text-xl">投稿情報</h2>
        <dl className="space-y-2">
          <div>
            <dt className="font-medium text-muted-foreground text-sm">
              タイトル
            </dt>
            <dd>{post.title || '(タイトルなし)'}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground text-sm">
              スラッグ
            </dt>
            <dd>
              <code className="text-sm">{post.slug}</code>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground text-sm">
              現在のバージョン
            </dt>
            <dd>
              {versions.length > 0 && versions[0]
                ? `v${versions[0].version_number}`
                : '不明'}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-bold text-xl">バージョン履歴</h2>

        {versions.length === 0 ? (
          <p className="text-muted-foreground">バージョン履歴がありません</p>
        ) : (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div
                className="rounded border border-border p-4"
                key={version.id}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        バージョン {version.version_number}
                      </span>
                      {index === 0 && <Badge variant="default">現在</Badge>}
                    </div>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {new Date(version.created_at).toLocaleString('ja-JP')}
                      {' • '}
                      {version.profile?.name || '不明'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      render={
                        <Link
                          href={`/admin/posts/${postId}/versions/${version.id}`}
                        />
                      }
                      size="sm"
                      variant="outline"
                    >
                      詳細
                    </Button>
                    {index > 0 && (
                      <Button
                        render={
                          <Link
                            href={`/admin/posts/${postId}/versions/compare?from=${versions[index].id}&to=${versions[0].id}`}
                          />
                        }
                        size="sm"
                        variant="outline"
                      >
                        現在と比較
                      </Button>
                    )}
                  </div>
                </div>

                {version.change_summary && (
                  <div className="rounded-sm bg-muted px-3 py-2 text-sm">
                    {version.change_summary}
                  </div>
                )}

                {version.title && (
                  <div className="mt-2">
                    <span className="font-medium text-muted-foreground text-sm">
                      タイトル:{' '}
                    </span>
                    <span className="text-sm">{version.title}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button
          render={<Link href={`/admin/posts/${postId}`} />}
          variant="outline"
        >
          投稿編集に戻る
        </Button>
        <Button render={<Link href="/admin/posts" />} variant="outline">
          一覧に戻る
        </Button>
      </div>
    </div>
  )
}

export default async function VersionsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">バージョン履歴</h1>
      <Suspense fallback={<VersionsSkeleton />}>
        <VersionsContent postId={id} />
      </Suspense>
    </div>
  )
}
