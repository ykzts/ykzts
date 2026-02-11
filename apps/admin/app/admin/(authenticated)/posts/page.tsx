import { Badge } from '@ykzts/ui/components/badge'
import { Card } from '@ykzts/ui/components/card'
import Link from 'next/link'
import { Suspense } from 'react'
import { getPosts } from '@/lib/posts'
import { NewPostButton } from './_components/new-post-button'
import { PostsFilters } from './_components/posts-filters'
import { PostsPagination } from './_components/posts-pagination'

async function PostsContent({
  page,
  perPage,
  search,
  status
}: {
  page: number
  perPage: number
  search?: string
  status: 'draft' | 'scheduled' | 'published' | 'all'
}) {
  const result = await getPosts({ page, perPage, search, status })

  return (
    <>
      <Card className="p-6">
        {!result.data || result.data.length === 0 ? (
          <p className="text-muted-foreground">投稿がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="px-4 py-3 text-left">タイトル</th>
                  <th className="px-4 py-3 text-left">ステータス</th>
                  <th className="px-4 py-3 text-left">公開日時</th>
                  <th className="px-4 py-3 text-left">作成者</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((post) => (
                  <tr className="border-border border-b" key={post.id}>
                    <td className="px-4 py-3">
                      {post.title || '(タイトルなし)'}
                    </td>
                    <td className="px-4 py-3">
                      {post.status === 'published' && (
                        <Badge variant="default">公開</Badge>
                      )}
                      {post.status === 'draft' && (
                        <Badge variant="secondary">下書き</Badge>
                      )}
                      {post.status === 'scheduled' && (
                        <Badge variant="outline">予約</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString(
                            'ja-JP',
                            {
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }
                          )
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.profile?.name || '不明'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        className="text-primary hover:underline"
                        href={`/admin/posts/${post.id}`}
                      >
                        編集
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {result.totalPages > 1 && (
        <PostsPagination currentPage={page} totalPages={result.totalPages} />
      )}
    </>
  )
}

export default async function PostsPage({
  searchParams
}: {
  searchParams: Promise<{
    page?: string
    perPage?: string
    search?: string
    status?: string
  }>
}) {
  const params = await searchParams
  const page = Number.parseInt(params.page || '1', 10)
  const perPage = Number.parseInt(params.perPage || '20', 10)
  const search = params.search
  const status =
    (params.status as 'draft' | 'scheduled' | 'published' | 'all') || 'all'

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Posts</h1>
        <NewPostButton />
      </div>

      <PostsFilters />

      <Suspense
        fallback={
          <Card className="p-6">
            <div>Loading...</div>
          </Card>
        }
      >
        <PostsContent
          page={page}
          perPage={perPage}
          search={search}
          status={status}
        />
      </Suspense>
    </div>
  )
}
