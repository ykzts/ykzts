import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { generatePostEmbeddings } from "@/workflows/generate-post-embeddings";

async function handleCronRequest(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fire-and-forget: enqueue the durable workflow.
    // The cron handler returns immediately; do not await run.returnValue.
    const run = await start(generatePostEmbeddings, []);
    return NextResponse.json({
      message: "Workflow started for post embeddings",
      runId: run.runId,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Embedding generation failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Cron endpoint to generate embeddings for posts
 * Should be called periodically by Vercel Cron or similar service
 *
 * GET /api/cron/posts/embeddings (default for Vercel Cron)
 * POST /api/cron/posts/embeddings
 * PUT /api/cron/posts/embeddings
 *
 * Authorization: Bearer <CRON_SECRET>
 */
export const GET = handleCronRequest;
export const PUT = handleCronRequest;
export const POST = handleCronRequest;
