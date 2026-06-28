import { getPostUrl } from "@ykzts/supabase/blog-urls";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase/client";

export async function enableDraftPreviewForSlug(
  slug: string,
  requestUrl: string
): Promise<NextResponse> {
  const client = supabaseAdmin ?? supabase;

  if (!client) {
    return NextResponse.redirect(new URL("/blog", requestUrl));
  }

  try {
    const { data: post, error: postError } = await client
      .from("posts")
      .select("slug, published_at")
      .eq("slug", slug)
      .maybeSingle();

    if (postError) {
      console.error("Error fetching draft post:", postError.message);
      return NextResponse.redirect(new URL("/blog", requestUrl));
    }

    if (post) {
      const draft = await draftMode();
      draft.enable();

      return NextResponse.redirect(
        new URL(
          getPostUrl({ slug: post.slug as string, published_at: null }),
          requestUrl
        )
      );
    }
  } catch (error) {
    console.error("Error fetching post for draft mode:", error);
  }

  return NextResponse.redirect(new URL("/blog", requestUrl));
}
