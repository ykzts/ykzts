import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ProfilesPage() {
  const supabase = await createClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, tagline, email, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`プロフィールの取得に失敗しました: ${error.message}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profiles</h1>
        <Link className="btn" href="/admin/profiles/new">
          新規作成
        </Link>
      </div>

      <div className="card">
        {!profiles || profiles.length === 0 ? (
          <p className="text-muted">プロフィールがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">名前</th>
                  <th className="text-left py-3 px-4">キャッチコピー</th>
                  <th className="text-left py-3 px-4">メール</th>
                  <th className="text-left py-3 px-4">作成日</th>
                  <th className="text-right py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr className="border-b border-border" key={profile.id}>
                    <td className="py-3 px-4">{profile.name}</td>
                    <td className="py-3 px-4 text-muted">
                      {profile.tagline
                        ? profile.tagline.substring(0, 50) + '...'
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {profile.email || '-'}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {new Date(profile.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        className="text-accent hover:underline"
                        href={`/admin/profiles/${profile.id}`}
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
