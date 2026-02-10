import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { logout } from '../login/actions'

function UserInfo({ user }: { user: User }) {
  return (
    <div className="flex items-center">
      <span className="mr-4 text-muted text-sm">{user.email ?? 'Unknown'}</span>
      <form action={logout}>
        <button className="btn-secondary" type="submit">
          ログアウト
        </button>
      </form>
    </div>
  )
}

async function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode
}) {
  // Auth guard at layout level - runs before children render
  const user = await getCurrentUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-border border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link className="font-bold text-xl" href="/admin">
                  管理画面
                </Link>
              </div>
              <div className="ml-6 flex items-center space-x-4">
                <Link className="hover:text-accent" href="/admin/profile">
                  Profile
                </Link>
                <Link className="hover:text-accent" href="/admin/works">
                  Works
                </Link>
                <Link className="hover:text-accent" href="/admin/posts">
                  Posts
                </Link>
              </div>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <UserInfo user={user} />
            </Suspense>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default AuthenticatedLayout
