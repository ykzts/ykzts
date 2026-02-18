import { Button } from '@ykzts/ui/components/button'
import { UserCircle } from 'lucide-react'
import Image from 'next/image'
import { Suspense } from 'react'
import { Panel } from '@/components/panel'
import { getProfile, getSocialLinks, getTechnologies } from '@/lib/data'
import { formatDateTimeWithTimezone } from '@/lib/timezones'
import { ProfilePageSkeleton } from './_components/profile-page-skeleton'

async function ProfileContent() {
  const [profile, socialLinks, technologies] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getTechnologies()
  ])

  return (
    <Panel>
      {!profile ? (
        <div>
          <p className="text-muted-foreground">
            プロフィールがまだ作成されていません。編集ページから作成してください。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Avatar */}
          <div>
            <div className="mb-2 block font-medium text-sm">
              プロフィール画像
            </div>
            <div className="flex items-center justify-center">
              {profile.avatar_url ? (
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-border">
                  <Image
                    alt={`${profile.name}のプロフィール画像`}
                    className="object-cover"
                    fill
                    sizes="128px"
                    src={profile.avatar_url}
                  />
                </div>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-border bg-muted">
                  <UserCircle className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

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
            <div className="mb-1 block font-medium text-sm">タイムゾーン</div>
            <p>{profile.timezone}</p>
          </div>

          {socialLinks.length > 0 && (
            <div>
              <div className="mb-2 block font-medium text-sm">
                ソーシャルリンク
              </div>
              <ul className="space-y-1">
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      className="text-primary hover:underline"
                      href={link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.service || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {technologies.length > 0 && (
            <div>
              <div className="mb-2 block font-medium text-sm">技術タグ</div>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <span
                    className="rounded bg-muted/10 px-3 py-1 text-sm"
                    key={tech.id}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-1 block font-medium text-sm">作成日</div>
            <p className="text-muted-foreground text-sm">
              {formatDateTimeWithTimezone(profile.created_at, profile.timezone)}
            </p>
          </div>

          <div>
            <div className="mb-1 block font-medium text-sm">更新日</div>
            <p className="text-muted-foreground text-sm">
              {formatDateTimeWithTimezone(profile.updated_at, profile.timezone)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 border-border border-t pt-4">
        <form action="/profile/edit" method="get">
          <Button type="submit">編集</Button>
        </form>
      </div>
    </Panel>
  )
}

export default function ProfilePage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Profile</h1>
      </div>

      <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  )
}
