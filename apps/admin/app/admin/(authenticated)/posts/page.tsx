import Link from 'next/link'
import { Suspense } from 'react'
import { getPosts } from '@/lib/data'

async function PostsContent() {
  const posts = await getPosts()

  return (
    <div className="card">
      {!posts || posts.length === 0 ? (
        <p className="text-muted">投稿がありません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border border-b">
                <th className="px-4 py-3 text-left">タイトル</th>
                <th className="px-4 py-3 text-left">作成日</th>
                <th className="px-4 py-3 text-left">更新日</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr className="border-border border-b" key={post.id}>
                  <td className="px-4 py-3">
                    {post.title || '(タイトルなし)'}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(post.updated_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="text-accent hover:underline"
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
    </div>
  )
}

export default function PostsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Posts</h1>
        <Link className="btn" href="/admin/posts/new">
          新規作成
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <PostsContent />
      </Suspense>
    </div>
  )
}
