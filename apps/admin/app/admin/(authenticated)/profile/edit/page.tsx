import { Suspense } from 'react'
import { getProfile, getSocialLinks, getTechnologies } from '@/lib/data'
import ProfileForm from './profile-form'

async function ProfileFormWrapper() {
  const [profile, socialLinks, technologies] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getTechnologies()
  ])

  return (
    <ProfileForm
      initialData={profile}
      initialSocialLinks={socialLinks}
      initialTechnologies={technologies}
    />
  )
}

export default function EditProfilePage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">プロフィール編集</h1>
      <div className="card">
        <Suspense fallback={<div>読み込み中...</div>}>
          <ProfileFormWrapper />
        </Suspense>
      </div>
    </div>
  )
}
