import { getSiteOrigin } from "@ykzts/site-config";
import { getOwnerProfile } from "@ykzts/supabase/auth";
import { createServerClient } from "@ykzts/supabase/server";
import {
  extractFirstParagraph,
  isPortableTextValue,
  type PortableTextValue,
} from "@ykzts/utils/portable-text";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/header";
import { InlineMemoEditor } from "@/components/inline-memo-editor";
import MemoPortableText from "@/components/portable-text";
import { getPublicChildMemos, getPublicMemo } from "@/lib/memos";
import { supabase as browserSupabase } from "@/lib/supabase/client";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

interface Props {
  params: Promise<{ path: string[] }>;
}

function extractCurrentVersion<T>(
  currentVersion: T | T[] | null | undefined
): T | null {
  if (Array.isArray(currentVersion)) {
    return currentVersion[0] ?? null;
  }
  return currentVersion ?? null;
}

// Cache Components requires at least one result from generateStaticParams.
// This placeholder is used when no memos exist or Supabase is not configured.
const PLACEHOLDER_PARAMS = [{ path: ["_placeholder"] }];

export async function generateStaticParams() {
  if (!browserSupabase) {
    // Return placeholder when Supabase is not configured (e.g., during build without env vars)
    return PLACEHOLDER_PARAMS;
  }

  const { data: memos, error } = await browserSupabase
    .from("memos")
    .select("path")
    .eq("visibility", "public");

  // Build environments without live Supabase still need a valid sample path.
  if (error || !memos || memos.length === 0) {
    return PLACEHOLDER_PARAMS;
  }

  // Include memo paths and all prefix paths (for index pages)
  const pathSet = new Set<string>();
  for (const memo of memos) {
    pathSet.add(memo.path);
    const segments = memo.path.split("/");
    for (let i = 1; i < segments.length; i += 1) {
      pathSet.add(segments.slice(0, i).join("/"));
    }
  }

  return Array.from(pathSet).map((p) => ({ path: p.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const memoPath = path.join("/");

  if (!isSupabaseConfigured()) {
    return { title: "Not Found" };
  }

  const siteOrigin = getSiteOrigin();
  // Public metadata uses the cookie-free cached path so it stays prerenderable.
  const memo = await getPublicMemo(memoPath);

  if (!memo) {
    const children = await getPublicChildMemos(memoPath);

    if (children.length === 0) {
      return { title: "Not Found" };
    }

    return {
      alternates: { canonical: new URL(`/${memoPath}`, siteOrigin).toString() },
      title: memoPath,
    };
  }

  const currentVersion = extractCurrentVersion(memo.current_version);
  const title = currentVersion?.title ?? memo.path;
  const content = isPortableTextValue(currentVersion?.content)
    ? currentVersion.content
    : null;
  const description = extractFirstParagraph(content) || undefined;
  const canonicalUrl = new URL(`/${memoPath}`, siteOrigin).toString();

  return {
    alternates: { canonical: canonicalUrl },
    description,
    openGraph: {
      description,
      modifiedTime: memo.updated_at,
      publishedTime: memo.published_at ?? undefined,
      title,
      type: "article",
      url: canonicalUrl,
    },
    title,
  };
}

function MemoPageSkeleton() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 space-y-3">
          <div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      </main>
    </>
  );
}

async function getOwnerMemo(memoPath: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("memos")
    .select(
      "id, path, visibility, profile_id, published_at, updated_at, current_version:memo_versions!memos_current_version_id_fkey(id, title, content)"
    )
    .eq("path", memoPath)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

async function getOwnerChildMemos(pathPrefix: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("memos")
    .select(
      "id, path, visibility, current_version:memo_versions!memos_current_version_id_fkey(id, title)"
    )
    .like("path", `${pathPrefix}/%`)
    .order("path", { ascending: true });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

function renderMemoView({
  canEdit,
  memo,
  title,
  content,
}: {
  canEdit: boolean;
  memo: {
    id: string;
    path: string;
    visibility: string;
    published_at: string | null;
    updated_at: string;
  };
  title: string;
  content: PortableTextValue | null;
}) {
  const dateOptions: Intl.DateTimeFormatOptions = { timeZone: "Asia/Tokyo" };

  let body: React.ReactNode;
  if (canEdit) {
    body = (
      <InlineMemoEditor
        content={content}
        memoId={memo.id}
        memoPath={memo.path}
        title={title}
        visibility={memo.visibility as "public" | "private"}
      />
    );
  } else if (content) {
    body = <MemoPortableText value={content} />;
  } else {
    body = <p className="text-muted-foreground">コンテンツがありません。</p>;
  }

  return (
    <>
      <Header canEdit={canEdit} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-bold text-3xl">{title}</h1>
            <p className="mt-1 text-muted-foreground text-sm">/{memo.path}</p>
            {memo.visibility === "private" && (
              <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                非公開
              </span>
            )}
          </div>
        </div>

        {body}

        <div className="mt-8 border-border border-t pt-4 text-muted-foreground text-sm">
          <p>
            更新日時:{" "}
            {new Date(memo.updated_at).toLocaleString("ja-JP", dateOptions)}
          </p>
          {!!memo.published_at && (
            <p>
              公開日時:{" "}
              {new Date(memo.published_at).toLocaleString("ja-JP", dateOptions)}
            </p>
          )}
        </div>
      </main>
    </>
  );
}

function renderIndexView({
  canEdit,
  memoPath,
  children,
}: {
  canEdit: boolean;
  memoPath: string;
  children: Array<{
    id: string;
    path: string;
    visibility: string;
    current_version:
      | { id: string; title: string | null }
      | { id: string; title: string | null }[]
      | null;
  }>;
}) {
  return (
    <>
      <Header canEdit={canEdit} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 font-bold text-3xl">
          /{memoPath.split("/").at(-1) ?? memoPath}
        </h1>
        <p className="mb-6 text-muted-foreground text-sm">/{memoPath}</p>
        <ul className="space-y-2">
          {children.map((child) => {
            const version = extractCurrentVersion(child.current_version);
            const title = version?.title ?? child.path;
            return (
              <li key={child.id}>
                <Link
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                  href={`/${child.path}`}
                >
                  <span className="flex-1 font-medium">{title}</span>
                  <span className="text-muted-foreground text-sm">
                    /{child.path}
                  </span>
                  {child.visibility === "private" && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                      非公開
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}

/**
 * Public path: fully cached, no cookies.
 */
async function PublicMemoContent({ path: memoPath }: { path: string }) {
  const memo = await getPublicMemo(memoPath);

  if (!memo) {
    const children = await getPublicChildMemos(memoPath);

    if (children.length === 0) {
      notFound();
    }

    return renderIndexView({
      canEdit: false,
      children,
      memoPath,
    });
  }

  const currentVersion = extractCurrentVersion(memo.current_version);
  const title = currentVersion?.title ?? memo.path;
  const content = isPortableTextValue(currentVersion?.content)
    ? currentVersion.content
    : null;

  return renderMemoView({
    canEdit: false,
    content,
    memo,
    title,
  });
}

/**
 * Draft/owner path may include private memos and the inline editor.
 * Public visitors fall through to the cached public tree.
 */
async function MemoContent({ path: memoPath }: { path: string }) {
  const [{ isEnabled: isDraftMode }, ownerProfile] = await Promise.all([
    draftMode(),
    getOwnerProfile(),
  ]);

  if (!(isDraftMode && ownerProfile)) {
    return <PublicMemoContent path={memoPath} />;
  }

  const { data: memo, error } = await getOwnerMemo(memoPath);

  if (error) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-muted-foreground">
            メモの読み込みに失敗しました。
          </p>
        </main>
      </>
    );
  }

  if (!memo) {
    const { data: children, error: childError } =
      await getOwnerChildMemos(memoPath);

    if (childError) {
      return (
        <>
          <Header />
          <main className="mx-auto max-w-3xl px-4 py-8">
            <p className="text-muted-foreground">
              メモの読み込みに失敗しました。
            </p>
          </main>
        </>
      );
    }

    if (!children || children.length === 0) {
      notFound();
    }

    return renderIndexView({
      canEdit: true,
      children,
      memoPath,
    });
  }

  const canEdit = memo.profile_id === ownerProfile.id;
  const currentVersion = extractCurrentVersion(memo.current_version);
  const title = currentVersion?.title ?? memo.path;
  const content = isPortableTextValue(currentVersion?.content)
    ? currentVersion.content
    : null;

  return renderMemoView({
    canEdit,
    content,
    memo,
    title,
  });
}

export default async function MemoPage({ params }: Props) {
  const { path } = await params;
  const memoPath = path.join("/");

  return (
    <div className="min-h-screen bg-background">
      {/*
        Suspense only for draftMode/owner reads. Fallback is content-shaped
        (header chrome + skeleton), never a blank page. Public memo queries
        use "use cache" so they resolve from the data cache after the runtime
        check.
      */}
      <Suspense fallback={<MemoPageSkeleton />}>
        <MemoContent path={memoPath} />
      </Suspense>
    </div>
  );
}
