import { getProfile } from '@/lib/data'

export default async function ProfilePage() {
  const profile = await getProfile()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-3xl">Profile</h1>
      </div>

      <div className="card">
        {!profile ? (
          <div>
            <p className="text-muted">
              プロフィールがまだ作成されていません。編集ページから作成してください。
            </p>
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
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-border">
          <form action="/profile/edit" method="get">
            <button className="btn" type="submit">
              編集
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
