import type { User } from '@supabase/supabase-js'
import { Button } from '@ykzts/ui/components/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@ykzts/ui/components/sheet'
import { Menu, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { logout } from '../login/actions'

// biome-ignore lint/correctness/noUnusedFunctionParameters: user parameter will be used for profile picture when implemented
function UserInfo({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <form action={logout}>
        <Button className="hidden sm:flex" type="submit" variant="secondary">
          ログアウト
        </Button>
      </form>
    </div>
  )
}

const NAV_LINKS = [
  { href: '/profile', label: 'Profile' },
  { href: '/works', label: 'Works' },
  { href: '/posts', label: 'Posts' }
] as const

function MobileNav({ user }: { user: User }) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button className="sm:hidden" size="icon-sm" variant="ghost" />}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">メニューを開く</span>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>管理画面</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2 px-4">
          {NAV_LINKS.map(({ href, label }) => (
            <SheetClose
              key={href}
              render={
                <Link
                  className="flex items-center rounded-md px-3 py-2 font-medium text-base transition-colors hover:bg-muted"
                  href={href}
                />
              }
            >
              {label}
            </SheetClose>
          ))}
        </nav>
        <SheetFooter>
          <div className="flex items-center gap-3 border-t pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{user.email}</p>
            </div>
          </div>
          <form action={logout} className="mt-3">
            <Button className="w-full" type="submit" variant="outline">
              ログアウト
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

async function AuthGuard({ children }: { children: React.ReactNode }) {
  // Auth guard wrapped in Suspense - checks auth and redirects if needed
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <nav className="border-border border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <MobileNav user={user} />
              <Link className="font-bold text-xl" href="/">
                管理画面
              </Link>
              <div className="ml-2 hidden items-center gap-4 sm:flex">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link className="hover:text-primary" href={href} key={href}>
                    {label}
                  </Link>
                ))}
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
