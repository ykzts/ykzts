/**
 * Invalidate cache tags across blog and portfolio applications.
 * This function sends HTTP requests to revalidation endpoints to trigger
 * cache invalidation in deployed Next.js applications.
 */
export async function invalidateCaches(tag: string): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET

  if (!secret) {
    console.warn(
      'REVALIDATE_SECRET not configured, skipping cache invalidation'
    )
    return
  }

  const blogUrl = process.env.BLOG_URL
  const portfolioUrl = process.env.PORTFOLIO_URL

  const requests: Promise<Response>[] = []

  if (blogUrl) {
    requests.push(
      fetch(`${blogUrl}/api/revalidate`, {
        body: JSON.stringify({ tag }),
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': secret
        },
        method: 'POST'
      })
    )
  }

  if (portfolioUrl) {
    requests.push(
      fetch(`${portfolioUrl}/api/revalidate`, {
        body: JSON.stringify({ tag }),
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': secret
        },
        method: 'POST'
      })
    )
  }

  if (requests.length === 0) {
    console.warn(
      'BLOG_URL and PORTFOLIO_URL not configured, skipping cache invalidation'
    )
    return
  }

  try {
    await Promise.all(requests)
  } catch (error) {
    // Log but don't fail the action if cache invalidation fails
    console.error('Cache invalidation failed:', error)
  }
}
