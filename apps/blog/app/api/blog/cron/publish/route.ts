import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
// @ts-expect-error - workflow/api subpath types not resolved by tsc in this setup (runtime works, next typegen succeeds)
import { start } from "workflow/api";
import { supabaseAdmin } from "@/lib/supabase/client";
import { publishScheduledPosts } from "@/workflows/publish-scheduled-posts";

export async function GET(request: NextRequest) {
  // Verify Vercel Cron Secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { message: "Supabase not configured" },
      { status: 500 }
    );
  }

  try {
    // Fire-and-forget: enqueue the durable workflow.
    // The cron handler returns immediately; do not await run.returnValue.
    const run = await start(publishScheduledPosts, []);
    return NextResponse.json({
      message: "Workflow started for publishing scheduled posts",
      runId: run.runId,
    });
  } catch (error) {
    console.error("Error publishing scheduled posts:", error);
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Unknown error";
    return NextResponse.json(
      {
        error: errorMessage,
        message: "Failed to publish scheduled posts",
      },
      { status: 500 }
    );
  }
}
