import { Suspense } from 'react'
import { getProfile } from '@/lib/data'

async function ProfileContent() {
  const profile = await getProfile()

  return (
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
            <div className="mb-1 block font-medium text-sm">名前</div>
            <p className="text-lg">{profile.name}</p>
          </div>

          {profile.tagline && (
            <div>
              <div className="mb-1 block font-medium text-sm">
                キャッチコピー
              </div>
              <p>{profile.tagline}</p>
            </div>
          )}

          {profile.email && (
            <div>
              <div className="mb-1 block font-medium text-sm">
                メールアドレス
              </div>
              <p>{profile.email}</p>
            </div>
          )}

          <div>
            <div className="mb-1 block font-medium text-sm">作成日</div>
            <p className="text-muted text-sm">
              {new Date(profile.created_at).toLocaleString('ja-JP')}
            </p>
          </div>

          <div>
            <div className="mb-1 block font-medium text-sm">更新日</div>
            <p className="text-muted text-sm">
              {new Date(profile.updated_at).toLocaleString('ja-JP')}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 border-border border-t pt-4">
        <form action="/profile/edit" method="get">
          <button className="btn" type="submit">
            編集
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Profile</h1>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ProfileContent />
      </Suspense>
    </div>
  )
}
