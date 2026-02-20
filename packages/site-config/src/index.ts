const FALLBACK_ORIGIN = 'https://example.com'
const FALLBACK_NAME = 'example.com'

/**
 * Returns the site origin as a URL object.
 * Reads `NEXT_PUBLIC_SITE_ORIGIN` and falls back to `https://example.com` if
 * the variable is absent or contains an invalid URL.
 */
export function getSiteOrigin(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN ?? FALLBACK_ORIGIN)
  } catch {
    return new URL(FALLBACK_ORIGIN)
  }
}

/**
 * Returns only the host portion (no protocol) of the site origin.
 * Useful for Go import paths, which use the bare host as a package prefix.
 */
export function getSiteHost(): string {
  return getSiteOrigin().host
}

/**
 * Returns the human-readable site/brand name.
 * Reads `NEXT_PUBLIC_SITE_NAME` and falls back to `example.com` if absent.
 */
export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME ?? FALLBACK_NAME
}
