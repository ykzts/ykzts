import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@ykzts/ui/components/dropdown-menu'
import { User as UserIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/data'
import { logout } from '../login/actions'
import Navigation from './_components/navigation'

async function UserInfo() {
  const profile = await getProfile()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-muted transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {profile?.avatar_url ? (
          <Image
            alt={`${profile?.name ?? 'ユーザー'}のプロフィール画像`}
            className="h-full w-full object-cover"
            height={32}
            sizes="32px"
            src={profile.avatar_url}
            width={32}
          />
        ) : (
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem render={<Link href="/profile" />}>
          プロフィール
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/key-visual" />}>
          キービジュアル
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout}>
          <DropdownMenuItem
            render={<button className="w-full text-left" type="submit" />}
          >
            ログアウト
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserInfoFallback() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
      <UserIcon className="h-4 w-4 text-muted-foreground" />
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
      <header className="border-border border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link className="font-bold text-xl" href="/">
                管理画面
              </Link>
              <Navigation />
            </div>
            <Suspense fallback={<UserInfoFallback />}>
              <UserInfo />
            </Suspense>
          </div>
        </div>
      </header>
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
