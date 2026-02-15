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
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/data'
import { logout } from '../login/actions'

async function UserInfo() {
  const profile = await getProfile()

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted">
        {profile?.avatar_url ? (
          <Image
            alt={profile.name}
            className="h-full w-full object-cover"
            height={32}
            src={profile.avatar_url}
            width={32}
          />
        ) : (
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <form action={logout}>
        <Button className="hidden sm:flex" type="submit" variant="secondary">
          ログアウト
        </Button>
      </form>
    </div>
  )
}

function UserInfoFallback() {
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
            <Suspense
              fallback={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              }
            >
              <MobileUserAvatar />
            </Suspense>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {user.email ?? 'メールアドレスなし'}
              </p>
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

async function MobileUserAvatar() {
  const profile = await getProfile()

  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
      {profile?.avatar_url ? (
        <Image
          alt={profile.name}
          className="h-full w-full object-cover"
          height={40}
          src={profile.avatar_url}
          width={40}
        />
      ) : (
        <UserIcon className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
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
            <Suspense fallback={<UserInfoFallback />}>
              <UserInfo />
            </Suspense>
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
