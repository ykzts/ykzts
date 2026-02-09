import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get the single profile (there should only be one)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, tagline, email, about, created_at, updated_at')
    .maybeSingle()

  if (error) {
    throw new Error(`プロフィールの取得に失敗しました: ${error.message}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-3xl">Profile</h1>
      </div>

      <div className="card">
        {!profile ? (
          <div>
            <p className="text-muted mb-4">
              プロフィールがまだ作成されていません
            </p>
            <form action="/admin/profile/create" method="get">
              <button className="btn" type="submit">
                プロフィールを作成
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="block font-medium text-sm mb-1">名前</div>
              <p className="text-lg">{profile.name}</p>
            </div>

            {profile.tagline && (
              <div>
                <div className="block font-medium text-sm mb-1">
                  キャッチコピー
                </div>
                <p>{profile.tagline}</p>
              </div>
            )}

            {profile.email && (
              <div>
                <div className="block font-medium text-sm mb-1">
                  メールアドレス
                </div>
                <p>{profile.email}</p>
              </div>
            )}

            <div>
              <div className="block font-medium text-sm mb-1">作成日</div>
              <p className="text-muted text-sm">
                {new Date(profile.created_at).toLocaleString('ja-JP')}
              </p>
            </div>

            <div>
              <div className="block font-medium text-sm mb-1">更新日</div>
              <p className="text-muted text-sm">
                {new Date(profile.updated_at).toLocaleString('ja-JP')}
              </p>
            </div>

            <div className="pt-4">
              <form action="/admin/profile/edit" method="get">
                <button className="btn" type="submit">
                  編集
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
