import { Suspense } from 'react'
import { getProfile, getSocialLinks, getTechnologies } from '@/lib/data'
import ProfileForm from './_components/profile-form'
import ProfileEditSkeleton from './_components/skeleton'

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
      <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
        <Suspense fallback={<ProfileEditSkeleton />}>
          <ProfileFormWrapper />
        </Suspense>
      </div>
    </div>
  )
}
