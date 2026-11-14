import Link from "next/link";
import { Suspense } from "react";
import { Panel } from "@/components/panel";
import { getCounts } from "@/lib/data";
import { DashboardSkeleton } from "./_components/dashboard-skeleton";

async function DashboardContent() {
  const counts = await getCounts();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Link className="block" href="/works">
        <Panel className="transition-shadow hover:shadow-md">
          <h2 className="mb-2 text-xl font-semibold">Works</h2>
          <p className="text-3xl font-bold text-primary">{counts.works}</p>
          <p className="mt-2 text-sm text-muted-foreground">作品情報を管理</p>
        </Panel>
      </Link>

      <Link className="block" href="/posts">
        <Panel className="transition-shadow hover:shadow-md">
          <h2 className="mb-2 text-xl font-semibold">Posts</h2>
          <p className="text-3xl font-bold text-primary">{counts.posts}</p>
          <p className="mt-2 text-sm text-muted-foreground">投稿情報を管理</p>
        </Panel>
      </Link>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">ダッシュボード</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
