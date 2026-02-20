import { Badge } from '@ykzts/ui/components/badge'
import Link from 'next/link'
import { Suspense } from 'react'
import { AdminPagination } from '@/components/admin-pagination'
import { Panel } from '@/components/panel'
import { getDraftPreviewUrl } from '@/lib/blog-urls'
import { getProfileTimezone } from '@/lib/data'
import { getPosts } from '@/lib/posts'
import { formatDateWithTimezone } from '@/lib/timezones'
import { NewPostButton } from './_components/new-post-button'
import { PostsFilters } from './_components/posts-filters'
import { PostsSkeleton } from './_components/posts-skeleton'
import { PublicUrlCell } from './_components/public-url-cell'

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
  const [result, timezone] = await Promise.all([
    getPosts({ page, perPage, search, status }),
    getProfileTimezone()
  ])

  const draftSecret = process.env.DRAFT_SECRET ?? null

  return (
    <>
      <Panel>
        {!result.data || result.data.length === 0 ? (
          <p className="text-muted-foreground">投稿がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="px-4 py-3 text-left">タイトル</th>
                  <th className="px-4 py-3 text-left">ステータス</th>
                  <th className="px-4 py-3 text-left">公開URL</th>
                  <th className="px-4 py-3 text-left">公開日時</th>
                  <th className="px-4 py-3 text-left">更新日時</th>
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
                    <td className="px-4 py-3">
                      <PublicUrlCell
                        draftPreviewUrl={
                          post.status === 'draft' && post.slug && draftSecret
                            ? getDraftPreviewUrl(post.slug, draftSecret)
                            : null
                        }
                        publishedAt={post.published_at}
                        slug={post.slug}
                        status={
                          post.status as
                            | 'draft'
                            | 'scheduled'
                            | 'published'
                            | null
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.published_at
                        ? formatDateWithTimezone(post.published_at, timezone)
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.current_version?.version_date
                        ? formatDateWithTimezone(
                            post.current_version.version_date,
                            timezone
                          )
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.profile?.name || '不明'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        className="text-primary hover:underline"
                        href={`/posts/${post.id}`}
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
      </Panel>

      {result.totalPages > 1 && (
        <AdminPagination currentPage={page} totalPages={result.totalPages} />
      )}
    </>
  )
}

export default function PostsPage({
  searchParams
}: {
  searchParams: Promise<{
    page?: string
    perPage?: string
    search?: string
    status?: string
  }>
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Posts</h1>
        <NewPostButton />
      </div>

      <PostsFilters />

      <Suspense fallback={<PostsSkeleton />}>
        <PostsContentAsync searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function PostsContentAsync({
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
  let page = Number.parseInt(params.page || '1', 10)
  let perPage = Number.parseInt(params.perPage || '20', 10)

  // Validate pagination parameters
  if (!Number.isFinite(page) || page < 1) page = 1
  if (!Number.isFinite(perPage) || perPage < 1) perPage = 20

  const search = params.search
  const status = ['draft', 'scheduled', 'published', 'all'].includes(
    params.status || ''
  )
    ? (params.status as 'draft' | 'scheduled' | 'published' | 'all')
    : 'all'

  return (
    <PostsContent
      page={page}
      perPage={perPage}
      search={search}
      status={status}
    />
  )
}
