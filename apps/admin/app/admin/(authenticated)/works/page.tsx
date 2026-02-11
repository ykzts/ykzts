import { buttonVariants } from '@ykzts/ui/button'
import { Card } from '@ykzts/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'
import { getWorks } from '@/lib/data'

async function WorksContent() {
  const works = await getWorks()

  return (
    <Card className="p-6">
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
                    {new Date(work.starts_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(work.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="text-primary hover:underline"
                      href={`/admin/works/${work.id}`}
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
    </Card>
  )
}

export default function WorksPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Works</h1>
        <Link className={buttonVariants()} href="/admin/works/new">
          新規作成
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <WorksContent />
      </Suspense>
    </div>
  )
}
