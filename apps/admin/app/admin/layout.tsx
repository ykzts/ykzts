import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from './login/actions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link className="text-xl font-bold" href="/admin">
                  管理画面
                </Link>
              </div>
              <div className="flex items-center ml-6 space-x-4">
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
            <div className="flex items-center">
              <span className="text-sm text-muted mr-4">{user.email}</span>
              <form action={logout}>
                <button className="btn-secondary" type="submit">
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
