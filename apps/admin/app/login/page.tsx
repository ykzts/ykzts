import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import LoginForm from './login-form'

async function LoginContent() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="card w-full max-w-md">
        <h1 className="mb-6 font-bold text-2xl">管理画面ログイン</h1>
        <LoginForm />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
