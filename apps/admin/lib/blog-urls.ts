import { getSiteOrigin } from "@ykzts/site-config";
import { getDateBasedUrl } from "@ykzts/utils/blog-urls";

function sanitizeSlugForUrl(slug: string): string | null {
  const trimmed = slug.trim();
  if (!trimmed) {
    return null;
  }

  // Encode the slug so it is safe to use as a single URL path segment.
  // This preserves valid slugs while percent-encoding special characters.
  return encodeURIComponent(trimmed);
}

/**
 * Constructs a draft preview URL for a blog post.
 * @param slug - The post slug
 * @param draftSecret - The draft mode secret token
 * @returns Full URL to the draft preview endpoint (returns null if inputs are invalid)
 */
export function getDraftPreviewUrl(
  slug: string,
  draftSecret: string
): string | null {
  const trimmed = slug.trim();
  if (!(trimmed && draftSecret)) {
    return null;
  }

  try {
    const url = new URL("/api/blog/draft", getSiteOrigin());
    url.searchParams.set("secret", draftSecret);
    url.searchParams.set("slug", trimmed);
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Constructs a date-based URL for a blog post.
 * @param slug - The post slug
 * @param publishedAt - ISO 8601 timestamp of when the post was published
 * @returns Full URL to the public blog post (returns null if publishedAt is invalid)
 */
export function getBlogPostUrl(
  slug: string,
  publishedAt: string | null
): string | null {
  if (!(publishedAt && slug)) {
    return null;
  }

  const safeSlug = sanitizeSlugForUrl(slug);
  if (!safeSlug) {
    return null;
  }

  try {
    const date = new Date(publishedAt);
    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    // Reuse shared path builder (deduped date formatting logic)
    const path = getDateBasedUrl(safeSlug, publishedAt);
    return new URL(path, getSiteOrigin()).toString();
  } catch {
    return null;
  }
}
