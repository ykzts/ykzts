import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function WorksPage() {
  const supabase = await createClient()

  const { data: works } = await supabase
    .from('works')
    .select('*')
    .order('starts_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Works</h1>
        <Link className="btn" href="/admin/works/new">
          新規作成
        </Link>
      </div>

      <div className="card">
        {!works || works.length === 0 ? (
          <p className="text-muted">作品がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">タイトル</th>
                  <th className="text-left py-3 px-4">スラッグ</th>
                  <th className="text-left py-3 px-4">開始日</th>
                  <th className="text-left py-3 px-4">作成日</th>
                  <th className="text-right py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {works.map((work) => (
                  <tr className="border-b border-border" key={work.id}>
                    <td className="py-3 px-4">{work.title}</td>
                    <td className="py-3 px-4 text-muted">{work.slug}</td>
                    <td className="py-3 px-4 text-muted">
                      {new Date(work.starts_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {new Date(work.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        className="text-accent hover:underline"
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
      </div>
    </div>
  )
}
