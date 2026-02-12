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

  const requests: Promise<{ url: string; response: Response }>[] = []

  if (blogUrl) {
    requests.push(
      fetch(`${blogUrl}/api/revalidate`, {
        body: JSON.stringify({ tag }),
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': secret
        },
        method: 'POST'
      }).then((response) => ({ response, url: blogUrl }))
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
      }).then((response) => ({ response, url: portfolioUrl }))
    )
  }

  if (requests.length === 0) {
    console.warn(
      'BLOG_URL and PORTFOLIO_URL not configured, skipping cache invalidation'
    )
    return
  }

  try {
    const results = await Promise.all(requests)

    // Check for failed requests
    for (const { response, url } of results) {
      if (!response.ok) {
        console.error(
          `Cache invalidation failed for ${url}: ${response.status} ${response.statusText}`
        )
      }
    }
  } catch (error) {
    // Log but don't fail the action if cache invalidation fails
    console.error('Cache invalidation network error:', error)
  }
}
