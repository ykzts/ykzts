import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import LoginForm from './login-form'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getCurrentUser()

  // If user is already logged in, redirect to admin dashboard
  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">管理画面ログイン</h1>
        <LoginForm />
      </div>
    </div>
  )
}
