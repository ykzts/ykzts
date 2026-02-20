function sanitizeSlugForUrl(slug: string): string | null {
  const trimmed = slug.trim()
  if (!trimmed) {
    return null
  }

  // Encode the slug so it is safe to use as a single URL path segment.
  // This preserves valid slugs while percent-encoding special characters.
  return encodeURIComponent(trimmed)
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
  if (!publishedAt || !slug) {
    return null
  }

  const safeSlug = sanitizeSlugForUrl(slug)
  if (!safeSlug) {
    return null
  }

  try {
    const date = new Date(publishedAt)
    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return null
    }

    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')

    return `${process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://example.com'}/blog/${year}/${month}/${day}/${safeSlug}`
  } catch {
    return null
  }
}
