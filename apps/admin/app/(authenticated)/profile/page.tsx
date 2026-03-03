import { Suspense } from 'react'
import { Panel } from '@/components/panel'
import { getProfile, getSocialLinks, getTechnologies } from '@/lib/data'
import ProfileForm from './_components/profile-form'
import ProfileFormSkeleton from './_components/skeleton'

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

export default function ProfilePage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">プロフィール編集</h1>
      <Panel>
        <Suspense fallback={<ProfileFormSkeleton />}>
          <ProfileFormWrapper />
        </Suspense>
      </Panel>
    </div>
  )
}
