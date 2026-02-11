import { Card } from '@ykzts/ui/components/card'
import Link from 'next/link'
import { Suspense } from 'react'
import { getCounts } from '@/lib/data'

async function DashboardContent() {
  const counts = await getCounts()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Link className="block" href="/admin/profile">
        <Card className="p-6 transition-shadow hover:shadow-md">
          <h2 className="mb-2 font-semibold text-xl">Profile</h2>
          <p className="font-bold text-3xl text-primary">{counts.profiles}</p>
          <p className="mt-2 text-muted-foreground text-sm">
            プロフィール情報を管理
          </p>
        </Card>
      </Link>

      <Link className="block" href="/admin/works">
        <Card className="p-6 transition-shadow hover:shadow-md">
          <h2 className="mb-2 font-semibold text-xl">Works</h2>
          <p className="font-bold text-3xl text-primary">{counts.works}</p>
          <p className="mt-2 text-muted-foreground text-sm">作品情報を管理</p>
        </Card>
      </Link>

      <Link className="block" href="/admin/posts">
        <Card className="p-6 transition-shadow hover:shadow-md">
          <h2 className="mb-2 font-semibold text-xl">Posts</h2>
          <p className="font-bold text-3xl text-primary">{counts.posts}</p>
          <p className="mt-2 text-muted-foreground text-sm">投稿情報を管理</p>
        </Card>
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
