import { getOwnerProfile } from "@ykzts/supabase/auth";
import { createServerClient } from "@ykzts/supabase/server";
import { draftMode } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/header";
import { getPublicMemos } from "@/lib/memos";

function MemoListItems({
  memos,
}: {
  memos: Array<{
    id: string;
    path: string;
    visibility: string;
    title: string;
  }>;
}) {
  if (memos.length === 0) {
    return <p className="text-muted-foreground">メモがありません。</p>;
  }

  return (
    <ul className="space-y-2">
      {memos.map((memo) => (
        <li key={memo.id}>
          <Link
            className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
            href={`/${memo.path}`}
          >
            <span className="flex-1 font-medium">{memo.title}</span>
            {memo.visibility === "private" && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                非公開
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MemoListSkeleton() {
  return (
    <div className="space-y-2">
      {["a", "b", "c"].map((key) => (
        <div className="h-10 animate-pulse rounded-md bg-muted" key={key} />
      ))}
    </div>
  );
}

/**
 * Prefer the public cached list (static shell path). Only when draft mode is
 * enabled for the site owner do we hit the cookie-bound client for private rows.
 */
async function MemoList() {
  const [{ isEnabled: isDraftMode }, ownerProfile] = await Promise.all([
    draftMode(),
    getOwnerProfile(),
  ]);

  if (isDraftMode && ownerProfile) {
    const supabase = await createServerClient();
    const { data: memos, error } = await supabase
      .from("memos")
      .select(
        "id, path, visibility, published_at, updated_at, memo_versions(title)"
      )
      .order("updated_at", { ascending: false });

    if (error) {
      return (
        <p className="text-muted-foreground">メモの読み込みに失敗しました。</p>
      );
    }

    return (
      <MemoListItems
        memos={(memos ?? []).map((memo) => {
          const version = Array.isArray(memo.memo_versions)
            ? memo.memo_versions[0]
            : memo.memo_versions;
          return {
            id: memo.id,
            path: memo.path,
            title: version?.title ?? memo.path,
            visibility: memo.visibility,
          };
        })}
      />
    );
  }

  const memos = await getPublicMemos();

  return (
    <MemoListItems
      memos={memos.map((memo) => {
        const version = Array.isArray(memo.memo_versions)
          ? memo.memo_versions[0]
          : memo.memo_versions;
        return {
          id: memo.id,
          path: memo.path,
          title: version?.title ?? memo.path,
          visibility: memo.visibility,
        };
      })}
    />
  );
}

async function NewMemoButton() {
  const ownerProfile = await getOwnerProfile();

  if (!ownerProfile) {
    return null;
  }

  return (
    <Link
      className="rounded bg-primary px-3 py-1.5 text-primary-foreground text-sm hover:bg-primary/90"
      href="/new"
    >
      新規作成
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-bold text-2xl">メモ一覧</h1>
          <Suspense fallback={null}>
            <NewMemoButton />
          </Suspense>
        </div>
        <Suspense fallback={<MemoListSkeleton />}>
          <MemoList />
        </Suspense>
      </main>
    </div>
  );
}
