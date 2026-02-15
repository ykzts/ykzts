import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@ykzts/ui/components/card'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import LoginForm from './login-form'

async function LoginContent() {
  const user = await getCurrentUser()
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">管理画面ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm isDevelopment={isDevelopment} />
        </CardContent>
      </Card>
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
