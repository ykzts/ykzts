import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './login-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  // If user is already logged in, redirect to admin dashboard
  if (user) {
    redirect('/admin')
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
