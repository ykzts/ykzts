import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get counts
  const [
    { count: profilesCount },
    { count: worksCount },
    { count: postsCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('works').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true })
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          className="card hover:shadow-md transition-shadow"
          href="/admin/profiles"
        >
          <h2 className="text-xl font-semibold mb-2">Profiles</h2>
          <p className="text-3xl font-bold text-accent">{profilesCount ?? 0}</p>
          <p className="text-sm text-muted mt-2">プロフィール情報を管理</p>
        </Link>

        <Link
          className="card hover:shadow-md transition-shadow"
          href="/admin/works"
        >
          <h2 className="text-xl font-semibold mb-2">Works</h2>
          <p className="text-3xl font-bold text-accent">{worksCount ?? 0}</p>
          <p className="text-sm text-muted mt-2">作品情報を管理</p>
        </Link>

        <Link
          className="card hover:shadow-md transition-shadow"
          href="/admin/posts"
        >
          <h2 className="text-xl font-semibold mb-2">Posts</h2>
          <p className="text-3xl font-bold text-accent">{postsCount ?? 0}</p>
          <p className="text-sm text-muted mt-2">投稿情報を管理</p>
        </Link>
      </div>
    </div>
  )
}
