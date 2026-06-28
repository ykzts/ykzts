export interface BlogPostUrlInput {
  published_at: string | null;
  slug: string | null;
}

export interface BlogPostUrlOptions {
  /** Return an absolute URL. Requires `origin`. */
  full?: boolean;
  /** Append `.md` for markdown alternate URLs. */
  markdown?: boolean;
  /** Site origin used when `full` is true. */
  origin?: string | URL;
}

function buildPublishedPostPath(
  slug: string,
  publishedAt: string,
  markdown = false
): string {
  const date = new Date(publishedAt);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const suffix = markdown ? ".md" : "";

  return `/blog/${year}/${month}/${day}/${encodeURIComponent(slug)}${suffix}`;
}

/**
 * Constructs a URL for a blog post.
 * Returns null when slug or published_at are missing or invalid for a public URL.
 */
export function getPostUrl(
  post: BlogPostUrlInput,
  options?: BlogPostUrlOptions
): string | null {
  const slug = post.slug?.trim();
  if (!slug) {
    return null;
  }

  const markdownSuffix = options?.markdown ? ".md" : "";

  if (!post.published_at?.trim()) {
    const path = `/blog/draft/${encodeURIComponent(slug)}${markdownSuffix}`;
    if (options?.full) {
      if (!options.origin) {
        throw new Error("origin is required when full is true");
      }

      return new URL(path, options.origin).toString();
    }

    return path;
  }

  const publishedAt = post.published_at.trim();
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const path = buildPublishedPostPath(slug, publishedAt, options?.markdown);

  if (options?.full) {
    if (!options.origin) {
      throw new Error("origin is required when full is true");
    }

    return new URL(path, options.origin).toString();
  }

  return path;
}
