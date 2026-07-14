import { createServerClient } from "@ykzts/supabase/server";
import { cacheTag } from "next/cache";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  "use cache: private";
  cacheTag("auth-user");

  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Auth session missing is not an error, just means user is not logged in
  if (error && error.message !== "Auth session missing!") {
    throw new Error(`Failed to fetch current user: ${error.message}`);
  }

  return user;
}

/**
 * Return the current user, or null when unauthenticated.
 * Prefer this in server actions that should return an error state
 * instead of redirecting.
 */
export async function checkAuth() {
  return await getCurrentUser();
}

/**
 * Require an authenticated session; redirect to login when missing.
 * Call as the first statement of privileged server actions.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function getOwnerProfile() {
  "use cache: private";
  cacheTag("auth-user");

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`プロフィールの取得に失敗しました: ${error.message}`);
  }

  return data;
}
