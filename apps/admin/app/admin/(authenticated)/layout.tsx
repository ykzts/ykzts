import type { User } from '@supabase/supabase-js'
import { Button } from '@ykzts/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { logout } from '../login/actions'

function UserInfo({ user }: { user: User }) {
  return (
    <div className="flex items-center">
      <span className="mr-4 text-muted-foreground text-sm">
        {user.email ?? 'Unknown'}
      </span>
      <form action={logout}>
        <Button type="submit" variant="secondary">
          ログアウト
        </Button>
      </form>
    </div>
  )
}

async function AuthGuard({ children }: { children: React.ReactNode }) {
  // Auth guard wrapped in Suspense - checks auth and redirects if needed
  const user = await getCurrentUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <>
      <nav className="border-border border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex shrink-0 items-center">
                <Link className="font-bold text-xl" href="/admin">
                  管理画面
                </Link>
              </div>
              <div className="ml-6 flex items-center space-x-4">
                <Link className="hover:text-primary" href="/admin/profile">
                  Profile
                </Link>
                <Link className="hover:text-primary" href="/admin/works">
                  Works
                </Link>
                <Link className="hover:text-primary" href="/admin/posts">
                  Posts
                </Link>
              </div>
            </div>
            <UserInfo user={user} />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  )
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AuthGuard>{children}</AuthGuard>
      </Suspense>
    </div>
  )
}

export default AuthenticatedLayout
