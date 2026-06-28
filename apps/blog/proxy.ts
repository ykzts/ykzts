import { getPostUrl } from "@ykzts/supabase/blog-urls";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Handles redirects for old-style archive paths.
// - /blog/archive          → /blog/2025 (latest year with published posts, or /blog)
// - /blog/2025/05          → /blog/2025#month-05
// - /blog/2025/5           → /blog/2025#month-05 (pads month)
// - /blog/2025/05/12       → /blog/2025#month-05
// Note: /blog/:year/:month paths are not treated as legacy; they are supported
// convenience redirects to the year archive with the appropriate month anchor.
// Real post paths (/blog/2025/05/12/slug) are not matched.
const LEGACY_ARCHIVE_REGEX =
  /^\/blog\/(\d{4})\/(0?[1-9]|1[0-2])(?:\/(0?[1-9]|[12][0-9]|3[01]))?$/;

/**
 * Handles redirect from the old `/blog/archive` path to the most recent year
 * that has published posts (e.g. `/blog/2025`).
 */
async function handleArchiveRedirect(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (pathname !== "/blog/archive") {
    return null;
  }

  if (!supabase) {
    return NextResponse.redirect(new URL("/blog", request.url), 301);
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("published_at")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Error querying latest post for /blog/archive redirect:",
        error
      );
      return NextResponse.redirect(new URL("/blog", request.url), 301);
    }

    const latestYear = data?.published_at
      ? new Date(data.published_at).getUTCFullYear()
      : null;
    const target = latestYear ? `/blog/${latestYear}` : "/blog";
    return NextResponse.redirect(new URL(target, request.url), 301);
  } catch (err) {
    console.error("Middleware error (/blog/archive):", err);
    return NextResponse.redirect(new URL("/blog", request.url), 301);
  }
}

/**
 * Handles year/month (and year/month/day) paths by redirecting to the
 * corresponding year archive page with a month anchor.
 *
 * These are convenience redirects (e.g. /blog/2025/05 or /blog/2025/05/12),
 * not legacy-only. They allow direct links to months while keeping the
 * canonical URL as /blog/2025#month-05.
 *
 * Examples:
 *   /blog/2025/05      → /blog/2025#month-05
 *   /blog/2025/5       → /blog/2025#month-05 (month normalized to 2 digits)
 *   /blog/2025/05/12   → /blog/2025#month-05
 *
 * Full post URLs (/blog/2025/05/12/slug) are not matched.
 */
function handleLegacyArchiveRedirect(
  request: NextRequest
): NextResponse | null {
  const { pathname } = request.nextUrl;
  const match = pathname.match(LEGACY_ARCHIVE_REGEX);
  if (!match) {
    return null;
  }

  const year = match[1];
  const month = match[2].padStart(2, "0");
  const target = `/blog/${year}#month-${month}`;
  return NextResponse.redirect(new URL(target, request.url), 301);
}

/**
 * Handles the `redirect_from` field on posts for custom old URLs.
 */
async function handleRedirectFrom(
  request: NextRequest
): Promise<NextResponse | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { pathname } = request.nextUrl;
    const { data: post, error } = await supabase
      .from("posts")
      .select("slug, published_at")
      .contains("redirect_from", [pathname])
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error("Error querying redirects:", error);
      return null;
    }

    if (post?.slug && post.published_at) {
      const canonicalUrl = getPostUrl({
        slug: post.slug,
        published_at: post.published_at,
      });
      return NextResponse.redirect(new URL(canonicalUrl, request.url), 301);
    }
  } catch (err) {
    console.error("Middleware error:", err);
  }

  return null;
}

export async function proxy(request: NextRequest) {
  // Try each legacy redirect handler in priority order.
  // The first one that returns a response short-circuits.
  let response = await handleArchiveRedirect(request);
  if (response) {
    return response;
  }

  response = handleLegacyArchiveRedirect(request);
  if (response) {
    return response;
  }

  response = await handleRedirectFrom(request);
  if (response) {
    return response;
  }

  // No redirect matched — continue normal routing.
  return NextResponse.next();
}

export const config = {
  matcher: "/blog/:path*",
};
