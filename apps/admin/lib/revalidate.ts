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

  const revalidateUrlsEnv = process.env.REVALIDATE_URLS
  if (!revalidateUrlsEnv) {
    console.warn('REVALIDATE_URLS not configured, skipping cache invalidation')
    return
  }

  // Parse comma-separated URLs
  const urls = revalidateUrlsEnv
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0)

  if (urls.length === 0) {
    console.warn(
      'No valid URLs in REVALIDATE_URLS, skipping cache invalidation'
    )
    return
  }

  // Create requests with timeout and proper URL construction
  const requests = urls.map((baseUrl) => {
    const requestUrl = new URL(baseUrl).toString()
    return fetch(requestUrl, {
      body: JSON.stringify({ tag }),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': secret
      },
      method: 'POST',
      signal: AbortSignal.timeout(5000)
    })
      .then(
        (response) =>
          ({ ok: true, response, url: requestUrl }) as
            | { ok: true; response: Response; url: string }
            | { error: unknown; ok: false; url: string }
      )
      .catch(
        (error) =>
          ({ error, ok: false, url: requestUrl }) as
            | { ok: true; response: Response; url: string }
            | { error: unknown; ok: false; url: string }
      )
  })

  // Wait for all requests to complete
  const results = await Promise.all(requests)

  // Log any failures
  for (const result of results) {
    if (!result.ok) {
      console.error(
        `Cache invalidation network error for ${result.url}:`,
        result.error
      )
    } else if (!result.response.ok) {
      console.error(
        `Cache invalidation failed for ${result.url}: ${result.response.status} ${result.response.statusText}`
      )
    }
  }
}
