import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { getCurrentUser } from '@/lib/auth'

type HeaderProps = {
  canEdit?: boolean
}

export default async function Header({ canEdit = false }: HeaderProps) {
  const user = await getCurrentUser()

  return (
    <header className="border-border border-b bg-background">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link className="font-bold text-xl" href="/">
          Memo
        </Link>
        <nav className="flex items-center gap-4">
          {canEdit && (
            <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              編集モード
            </span>
          )}
          {user ? (
            <form action={logout}>
              <button
                className="text-muted-foreground text-sm hover:text-foreground"
                type="submit"
              >
                ログアウト
              </button>
            </form>
          ) : (
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/login"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
