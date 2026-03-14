import { redirect } from 'next/navigation'
import Header from '@/components/header'
import { NewMemoForm } from '@/components/new-memo-form'
import { getOwnerProfile } from '@/lib/auth'

export default async function NewMemoPage() {
  const ownerProfile = await getOwnerProfile()

  if (!ownerProfile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header canEdit={true} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 font-bold text-2xl">新規メモ作成</h1>
        <NewMemoForm />
      </main>
    </div>
  )
}
