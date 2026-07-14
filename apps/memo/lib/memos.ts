import { createBrowserClient } from "@ykzts/supabase/client";
import { cacheTag } from "next/cache";

interface MemoRow {
  current_version:
    | { id: string; title: string | null; content: unknown }
    | { id: string; title: string | null; content: unknown }[]
    | null;
  id: string;
  path: string;
  profile_id: string;
  published_at: string | null;
  updated_at: string;
  visibility: string;
}

interface MemoListRow {
  id: string;
  memo_versions: { title: string | null } | { title: string | null }[] | null;
  path: string;
  published_at: string | null;
  updated_at: string;
  visibility: string;
}

interface ChildMemoRow {
  current_version:
    | { id: string; title: string | null }
    | { id: string; title: string | null }[]
    | null;
  id: string;
  path: string;
  visibility: string;
}

function createPublicClient() {
  if (
    !(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  ) {
    return null;
  }

  // Cookie-free browser client — safe inside "use cache" (no request cookies).
  return createBrowserClient();
}

/**
 * Public memo list for the home page. Cookie-free so it can join the static shell.
 */
export async function getPublicMemos(): Promise<MemoListRow[]> {
  "use cache";
  cacheTag("memos");

  const supabase = createPublicClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("memos")
    .select(
      "id, path, visibility, published_at, updated_at, memo_versions(title)"
    )
    .eq("visibility", "public")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch public memos:", error.message);
    return [];
  }

  return (data ?? []) as MemoListRow[];
}

/**
 * Single public memo by path. Cookie-free so it can join the static shell.
 */
export async function getPublicMemo(memoPath: string): Promise<MemoRow | null> {
  "use cache";
  cacheTag("memos");

  const supabase = createPublicClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("memos")
    .select(
      "id, path, visibility, profile_id, published_at, updated_at, current_version:memo_versions!memos_current_version_id_fkey(id, title, content)"
    )
    .eq("path", memoPath)
    .eq("visibility", "public")
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch public memo:", error.message);
    return null;
  }

  return data as MemoRow | null;
}

/**
 * Child public memos under a path prefix (index pages).
 */
export async function getPublicChildMemos(
  pathPrefix: string
): Promise<ChildMemoRow[]> {
  "use cache";
  cacheTag("memos");

  const supabase = createPublicClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("memos")
    .select(
      "id, path, visibility, current_version:memo_versions!memos_current_version_id_fkey(id, title)"
    )
    .eq("visibility", "public")
    .like("path", `${pathPrefix}/%`)
    .order("path", { ascending: true });

  if (error) {
    console.error("Failed to fetch child memos:", error.message);
    return [];
  }

  return (data ?? []) as ChildMemoRow[];
}
