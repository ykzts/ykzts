import { getSiteOrigin } from "@ykzts/site-config";
import type { BlogPostUrlInput } from "./dto.js";

export type { BlogPostUrlInput } from "./dto.js";

export interface BlogPostUrlOptions {
  /** Return an absolute URL. Requires `origin`. */
  full?: boolean;
  /** Append `.md` for markdown alternate URLs. */
  markdown?: boolean;
  /** Site origin used when `full` is true. */
  origin?: string | URL;
}

function encodeSlugForPath(slug: string | null): string {
  const trimmed = slug?.trim();
  if (!trimmed) {
    throw new Error("slug is required");
  }

  return encodeURIComponent(trimmed);
}

function buildPublishedPostPath(
  post: BlogPostUrlInput,
  markdown = false
): string {
  const { slug, published_at: publishedAt } = post;

  if (!publishedAt) {
    throw new Error("published_at is required for date-based URLs");
  }

  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid published_at: ${publishedAt}`);
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const suffix = markdown ? ".md" : "";

  return `/blog/${year}/${month}/${day}/${encodeSlugForPath(slug)}${suffix}`;
}

/**
 * Constructs a URL for a blog post.
 * @param post - Post fields required for URL construction (`slug`, `published_at`)
 * @param options - Optional settings for markdown alternate URLs and absolute URLs
 * @returns Date-based URL for published posts, or /blog/draft/slug for draft posts
 */
export function getPostUrl(
  post: BlogPostUrlInput,
  options?: BlogPostUrlOptions
): string {
  const markdownSuffix = options?.markdown ? ".md" : "";
  const path = post.published_at
    ? buildPublishedPostPath(post, options?.markdown)
    : `/blog/draft/${encodeSlugForPath(post.slug)}${markdownSuffix}`;

  if (options?.full) {
    if (!options.origin) {
      throw new Error("origin is required when full is true");
    }

    return new URL(path, options.origin).toString();
  }

  return path;
}

/**
 * Constructs a full public blog post URL.
 * Returns null when slug or publishedAt are missing or invalid.
 */
export function getBlogPostUrl(
  slug: string,
  publishedAt: string | null
): string | null {
  if (!(publishedAt && slug)) {
    return null;
  }

  const trimmed = slug.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const date = new Date(publishedAt);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return getPostUrl(
      { slug: trimmed, published_at: publishedAt },
      {
        full: true,
        origin: getSiteOrigin(),
      }
    );
  } catch {
    return null;
  }
}
