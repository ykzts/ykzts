import { getCurrentUser } from "@ykzts/supabase/auth";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/login/actions";

interface HeaderProps {
  canEdit?: boolean;
}

function HeaderChrome({
  canEdit = false,
  children,
}: {
  canEdit?: boolean;
  children: React.ReactNode;
}) {
  return (
    <header className="border-border border-b bg-background">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link className="font-bold text-xl" href="/">
          Memo
        </Link>
        <nav className="flex items-center gap-4">
          {!!canEdit && (
            <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              編集モード
            </span>
          )}
          {children}
        </nav>
      </div>
    </header>
  );
}

async function HeaderAuth() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <form action={logout}>
        <button
          className="text-muted-foreground text-sm hover:text-foreground"
          type="submit"
        >
          ログアウト
        </button>
      </form>
    );
  }

  return (
    <Link
      className="text-muted-foreground text-sm hover:text-foreground"
      href="/login"
    >
      ログイン
    </Link>
  );
}

function HeaderAuthFallback() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-5 w-16 animate-pulse rounded bg-muted"
    />
  );
}

/**
 * Site header with static chrome in the shell and auth controls streamed
 * behind a small Suspense boundary (private cache / cookies).
 */
export default function Header({ canEdit = false }: HeaderProps) {
  return (
    <HeaderChrome canEdit={canEdit}>
      <Suspense fallback={<HeaderAuthFallback />}>
        <HeaderAuth />
      </Suspense>
    </HeaderChrome>
  );
}
