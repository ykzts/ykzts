import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function PostsPage() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`投稿の取得に失敗しました: ${error.message}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Link className="btn" href="/admin/posts/new">
          新規作成
        </Link>
      </div>

      <div className="card">
        {!posts || posts.length === 0 ? (
          <p className="text-muted">投稿がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">タイトル</th>
                  <th className="text-left py-3 px-4">作成日</th>
                  <th className="text-left py-3 px-4">更新日</th>
                  <th className="text-right py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr className="border-b border-border" key={post.id}>
                    <td className="py-3 px-4">
                      {post.title || '(タイトルなし)'}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {new Date(post.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {new Date(post.updated_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-3 px-4 text-right">
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
    </div>
  )
}
