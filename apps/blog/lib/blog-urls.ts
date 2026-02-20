import type { Route } from 'next'

/**
 * Constructs a date-based URL path for a blog post.
 * @param slug - The post slug
 * @param publishedAt - ISO 8601 timestamp of when the post was published
 * @returns Date-based URL in format /blog/YYYY/MM/DD/slug
 */
export function getDateBasedUrl(slug: string, publishedAt: string): Route {
  const date = new Date(publishedAt)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `/blog/${year}/${month}/${day}/${slug}` as Route
}

/**
 * Constructs a URL path for a blog post, handling draft posts with no published date.
 * @param slug - The post slug
 * @param publishedAt - ISO 8601 timestamp of when the post was published, or null for drafts
 * @returns Date-based URL for published posts, or /blog/draft/slug for draft posts
 */
export function getPostUrl(slug: string, publishedAt: string | null): Route {
  if (!publishedAt) {
    return `/blog/draft/${slug}` as Route
  }
  return getDateBasedUrl(slug, publishedAt)
}
