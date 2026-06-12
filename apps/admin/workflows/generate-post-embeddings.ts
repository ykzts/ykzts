import { createServiceRoleClient } from "@ykzts/supabase/service-role";
import type { Json } from "@ykzts/supabase/types";
import { generatePostEmbedding } from "@/lib/embeddings";

/**
 * Extract content from current_version returned by database function
 * The function returns a JSONB object with content and updated_at
 */
function extractVersionContent(currentVersion: unknown): Json | null {
  if (!currentVersion || typeof currentVersion !== "object") {
    return null;
  }

  const version = currentVersion as { content?: Json };
  return version?.content ?? null;
}

export interface EmbeddingWorkflowResult {
  errors?: Array<{ id: string; error: string }>;
  failureCount: number;
  message: string;
  processed: number;
  successCount: number;
}

/**
 * Step: fetch the current batch of posts that need fresh embeddings.
 * This RPC call becomes a durable, retryable step.
 */
async function fetchPostsNeedingEmbeddingsStep() {
  "use step";

  const supabase = createServiceRoleClient();

  const { data: posts, error: postsError } = await supabase.rpc(
    "get_posts_needing_embeddings",
    { batch_size: 10 }
  );

  if (postsError) {
    throw new Error(`Failed to fetch posts: ${postsError.message}`);
  }

  return posts ?? [];
}

/**
 * Step: generate embedding + update a single post.
 *
 * This is the key durable unit for the batch job.
 * - AI embedding generation (can be slow/expensive) is isolated.
 * - DB update is atomic with the generation for this post.
 * - If this step fails transiently (AI Gateway hiccup, DB contention), the
 *   Workflow runtime will automatically retry *just this post*, not the whole batch.
 * - Each post appears as its own step in the observability dashboard.
 */
async function processPostEmbeddingStep(post: unknown) {
  "use step";

  const supabase = createServiceRoleClient();
  const postData = post as {
    current_version?: unknown;
    excerpt?: string | null;
    id: string;
    title?: string | null;
  };

  const content = extractVersionContent(postData.current_version);

  if (!content) {
    // Data-level problem for this post — do not retry forever.
    // We throw a normal error here; the caller (workflow) will count it
    // as a soft failure. For truly permanent issues you can import
    // { FatalError } from "workflow" and throw that instead.
    throw new Error("No content found");
  }

  // Generate embedding (via AI SDK + AI Gateway)
  const embedding = await generatePostEmbedding({
    content,
    excerpt: postData.excerpt,
    title: postData.title ?? "",
  });

  // Update post with embedding and set timestamp
  const { error: updateError } = await supabase
    .from("posts")
    .update({
      embedding: JSON.stringify(embedding),
      embedding_updated_at: new Date().toISOString(),
    })
    .eq("id", postData.id);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

/**
 * Durable workflow for generating embeddings for posts that need them.
 *
 * Triggered hourly by the cron route handler (after CRON_SECRET verification).
 *
 * This is a proper Workflow + Steps implementation:
 * - "use workflow" defines the high-level orchestration (fetch batch + loop).
 * - "use step" is used for the actual work (fetch + per-post processing).
 *
 * Benefits:
 * - Partial progress: if the job is interrupted after 4/10 posts, the next
 *   invocation (or automatic resume) continues from where it left off.
 * - Per-post retries for transient AI/DB failures without re-processing
 *   already successful posts.
 * - Excellent visibility: every post's embedding work shows as a separate
 *   step in the Vercel dashboard with timing, errors, and logs.
 */
export async function generatePostEmbeddings(): Promise<EmbeddingWorkflowResult> {
  "use workflow";

  const posts = await fetchPostsNeedingEmbeddingsStep();

  if (posts.length === 0) {
    return {
      message: "No posts need embedding updates",
      processed: 0,
      successCount: 0,
      failureCount: 0,
    };
  }

  let successCount = 0;
  let failureCount = 0;
  const errors: Array<{ id: string; error: string }> = [];

  // Process each post as its own durable step.
  // The workflow loop provides orchestration; each call to the step
  // is independently checkpointed and retried by the Workflow runtime.
  for (const post of posts) {
    try {
      await processPostEmbeddingStep(post);
      successCount++;
    } catch (error) {
      errors.push({
        error: error instanceof Error ? error.message : "Unknown error",
        id: post.id,
      });
      failureCount++;
    }
  }

  return {
    errors: errors.length > 0 ? errors : undefined,
    failureCount,
    message: "Embedding generation completed",
    processed: posts.length,
    successCount,
  };
}
