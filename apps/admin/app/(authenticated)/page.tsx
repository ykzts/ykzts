import Link from 'next/link'
import { Suspense } from 'react'
import { getCounts } from '@/lib/data'

async function DashboardContent() {
  const counts = await getCounts()

  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
      <Link className="card hover:shadow-md transition-shadow" href="/profile">
        <h2 className="font-semibold mb-2 text-xl">Profile</h2>
        <p className="font-bold text-3xl text-accent">{counts.profiles}</p>
        <p className="mt-2 text-muted text-sm">プロフィール情報を管理</p>
      </Link>

      <Link className="card hover:shadow-md transition-shadow" href="/works">
        <h2 className="font-semibold mb-2 text-xl">Works</h2>
        <p className="font-bold text-3xl text-accent">{counts.works}</p>
        <p className="mt-2 text-muted text-sm">作品情報を管理</p>
      </Link>

      <Link className="card hover:shadow-md transition-shadow" href="/posts">
        <h2 className="font-semibold mb-2 text-xl">Posts</h2>
        <p className="font-bold text-3xl text-accent">{counts.posts}</p>
        <p className="mt-2 text-muted text-sm">投稿情報を管理</p>
      </Link>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
