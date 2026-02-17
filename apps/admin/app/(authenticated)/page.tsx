import Link from 'next/link'
import { Suspense } from 'react'
import { getCounts } from '@/lib/data'

async function DashboardContent() {
  const counts = await getCounts()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Link className="block" href="/profile">
        <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
          <h2 className="mb-2 font-semibold text-xl">Profile</h2>
          <p className="font-bold text-3xl text-primary">{counts.profiles}</p>
          <p className="mt-2 text-muted-foreground text-sm">
            プロフィール情報を管理
          </p>
        </div>
      </Link>

      <Link className="block" href="/works">
        <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
          <h2 className="mb-2 font-semibold text-xl">Works</h2>
          <p className="font-bold text-3xl text-primary">{counts.works}</p>
          <p className="mt-2 text-muted-foreground text-sm">作品情報を管理</p>
        </div>
      </Link>

      <Link className="block" href="/posts">
        <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
          <h2 className="mb-2 font-semibold text-xl">Posts</h2>
          <p className="font-bold text-3xl text-primary">{counts.posts}</p>
          <p className="mt-2 text-muted-foreground text-sm">投稿情報を管理</p>
        </div>
      </Link>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-8 font-bold text-3xl">ダッシュボード</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
