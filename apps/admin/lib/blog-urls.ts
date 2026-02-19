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

  try {
    const date = new Date(publishedAt)
    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return null
    }

    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')

    return `https://ykzts.com/blog/${year}/${month}/${day}/${slug}`
  } catch {
    return null
  }
}
