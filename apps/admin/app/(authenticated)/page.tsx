import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get counts
  const [profilesResult, worksResult, postsResult] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('works').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true })
  ])

  // Check for errors in any of the queries
  if (profilesResult.error) {
    throw new Error(
      `プロフィール数の取得に失敗しました: ${profilesResult.error.message}`
    )
  }
  if (worksResult.error) {
    throw new Error(`作品数の取得に失敗しました: ${worksResult.error.message}`)
  }
  if (postsResult.error) {
    throw new Error(`投稿数の取得に失敗しました: ${postsResult.error.message}`)
  }

  const profilesCount = profilesResult.count
  const worksCount = worksResult.count
  const postsCount = postsResult.count

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <Link
          className="card hover:shadow-md transition-shadow"
          href="/profile"
        >
          <h2 className="font-semibold mb-2 text-xl">Profile</h2>
          <p className="font-bold text-3xl text-accent">{profilesCount ?? 0}</p>
          <p className="mt-2 text-muted text-sm">プロフィール情報を管理</p>
        </Link>

        <Link className="card hover:shadow-md transition-shadow" href="/works">
          <h2 className="font-semibold mb-2 text-xl">Works</h2>
          <p className="font-bold text-3xl text-accent">{worksCount ?? 0}</p>
          <p className="mt-2 text-muted text-sm">作品情報を管理</p>
        </Link>

        <Link className="card hover:shadow-md transition-shadow" href="/posts">
          <h2 className="font-semibold mb-2 text-xl">Posts</h2>
          <p className="font-bold text-3xl text-accent">{postsCount ?? 0}</p>
          <p className="mt-2 text-muted text-sm">投稿情報を管理</p>
        </Link>
      </div>
    </div>
  )
}
