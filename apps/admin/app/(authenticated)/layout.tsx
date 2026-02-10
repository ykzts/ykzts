import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { logout } from '../login/actions'

async function UserInfo() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex items-center">
      <span className="mr-4 text-muted text-sm">{user.email}</span>
      <form action={logout}>
        <button className="btn-secondary" type="submit">
          ログアウト
        </button>
      </form>
    </div>
  )
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link className="font-bold text-xl" href="/">
                  管理画面
                </Link>
              </div>
              <div className="flex items-center ml-6 space-x-4">
                <Link className="hover:text-accent" href="/profile">
                  Profile
                </Link>
                <Link className="hover:text-accent" href="/works">
                  Works
                </Link>
                <Link className="hover:text-accent" href="/posts">
                  Posts
                </Link>
              </div>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <UserInfo />
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
