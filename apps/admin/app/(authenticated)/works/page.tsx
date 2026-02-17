import { Panel } from '@ykzts/ui/components/panel'
import Link from 'next/link'
import { Suspense } from 'react'
import { getProfileTimezone, getWorks } from '@/lib/data'
import { formatDateOnly } from '@/lib/timezones'
import { NewWorkButton } from './_components/new-work-button'
import { WorksPageSkeleton } from './_components/works-page-skeleton'

async function WorksContent() {
  const [works, timezone] = await Promise.all([
    getWorks(),
    getProfileTimezone()
  ])

  return (
    <Panel>
      {!works || works.length === 0 ? (
        <p className="text-muted-foreground">作品がありません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border border-b">
                <th className="px-4 py-3 text-left">タイトル</th>
                <th className="px-4 py-3 text-left">スラッグ</th>
                <th className="px-4 py-3 text-left">開始日</th>
                <th className="px-4 py-3 text-left">作成日</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {works.map((work) => (
                <tr className="border-border border-b" key={work.id}>
                  <td className="px-4 py-3">{work.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {work.slug}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateOnly(work.starts_at, timezone)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateOnly(work.created_at, timezone)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="text-primary hover:underline"
                      href={`/works/${work.id}`}
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
  )
}

export default function WorksPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Works</h1>
        <NewWorkButton />
      </div>

      <Suspense fallback={<WorksPageSkeleton />}>
        <WorksContent />
      </Suspense>
    </div>
  )
}
