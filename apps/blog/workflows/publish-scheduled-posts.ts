import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/client";

export interface PublishResult {
  error?: string;
  message: string;
  posts?: Array<{ id: string; slug: string | null; title: string | null }>;
  publishedCount: number;
}

/**
 * Step: fetch scheduled posts that are due for publishing.
 * Durable step with automatic retry + visibility.
 */
async function fetchScheduledPostsStep() {
  "use step";

  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  const now = new Date().toISOString();
  const { data: scheduledPosts, error: queryError } = await supabaseAdmin
    .from("posts")
    .select("id, slug, title")
    .eq("status", "scheduled")
    .lte("published_at", now);

  if (queryError) {
    throw queryError;
  }

  return scheduledPosts ?? [];
}

/**
 * Step: mark a batch of posts as published.
 */
async function markPostsAsPublishedStep(postIds: string[]) {
  "use step";

  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  const { error: updateError } = await supabaseAdmin
    .from("posts")
    .update({ status: "published" })
    .in("id", postIds);

  if (updateError) {
    throw updateError;
  }
}

/**
 * Step: revalidate the public blog cache after publishing.
 */
async function revalidatePublishedPostsStep() {
  "use step";

  revalidateTag("posts", "max");
  // Satisfy linter that expects at least one await in an async function.
  await Promise.resolve();
}

/**
 * Durable workflow for publishing scheduled posts.
 *
 * Triggered by the cron route handler (after CRON_SECRET verification).
 *
 * The workflow orchestrates the process by calling dedicated "use step" functions.
 * This gives per-operation durability: the query, the DB update, and the revalidate
 * are independently retryable, persist their results, and are visible as separate
 * steps in the Vercel Workflows dashboard.
 */
export async function publishScheduledPosts(): Promise<PublishResult> {
  "use workflow";

  const scheduledPosts = await fetchScheduledPostsStep();

  if (scheduledPosts.length === 0) {
    return {
      message: "No posts to publish",
      publishedCount: 0,
    };
  }

  const postIds = scheduledPosts.map((post) => post.id);
  await markPostsAsPublishedStep(postIds);
  await revalidatePublishedPostsStep();

  return {
    message: `Published ${scheduledPosts.length} post(s)`,
    posts: scheduledPosts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
    })),
    publishedCount: scheduledPosts.length,
  };
}
