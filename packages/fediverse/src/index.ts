import { lookup } from 'node:dns/promises'
import ipaddr from 'ipaddr.js'
import { z } from 'zod'

const webFingerJrdSchema = z.object({
  aliases: z.array(z.string()).optional(),
  subject: z.string()
})

type WebFingerJrd = z.infer<typeof webFingerJrdSchema>

function isValidPublicHostname(domain: string): boolean {
  if (domain.length > 253 || domain === 'localhost') {
    return false
  }

  if (!domain.includes('.')) {
    return false
  }

  return /^[a-z0-9.-]+$/i.test(domain)
}

function isPublicIpAddress(address: string): boolean {
  if (!ipaddr.isValid(address)) return false
  try {
    // process() normalises IPv4-mapped IPv6 (::ffff:x.x.x.x) to plain IPv4
    const addr = ipaddr.process(address)
    return addr.range() === 'unicast'
  } catch {
    return false
  }
}

async function isSafeDomain(domain: string): Promise<boolean> {
  if (!isValidPublicHostname(domain)) {
    return false
  }

  try {
    const resolvedAddresses = await lookup(domain, {
      all: true,
      verbatim: true
    })

    if (resolvedAddresses.length === 0) {
      return false
    }

    return resolvedAddresses.every((entry) => isPublicIpAddress(entry.address))
  } catch {
    return false
  }
}

async function fetchWebFinger(
  resource: string,
  domain: string
): Promise<WebFingerJrd | null> {
  try {
    if (!(await isSafeDomain(domain))) {
      return null
    }

    const url = new URL(`https://${domain}/.well-known/webfinger`)
    url.searchParams.set('resource', resource)

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/jrd+json, application/json' },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000)
    })

    if (response.status >= 300 && response.status < 400) {
      return null
    }

    if (!response.ok) {
      return null
    }

    const parsed = webFingerJrdSchema.safeParse(await response.json())

    if (!parsed.success) {
      return null
    }

    return parsed.data
  } catch {
    return null
  }
}

/**
 * Verify that a Fediverse account exists by querying the WebFinger endpoint.
 * Checks both `subject` and `aliases` in the JRD response.
 */
export async function verifyFediverseHandle(
  acct: string,
  domain: string
): Promise<boolean> {
  const jrd = await fetchWebFinger(`acct:${acct}`, domain)

  if (!jrd) {
    return false
  }

  const expected = `acct:${acct}`.toLowerCase()

  if (jrd.subject.toLowerCase() === expected) {
    return true
  }

  return jrd.aliases?.some((alias) => alias.toLowerCase() === expected) ?? false
}

/**
 * Resolve a Fediverse account handle from a URL using WebFinger (RFC 7033).
 * The URL is passed directly as the `resource` parameter so any URL-based
 * Fediverse identity (Mastodon, Misskey, Pleroma, etc.) is supported.
 * Returns the canonical `@user@domain` handle, or null if WebFinger
 * resolution fails or the response does not contain an `acct:` subject.
 */
export async function extractFediverseHandleFromURL(
  urlString: string
): Promise<string | null> {
  try {
    const url = new URL(urlString)

    if (url.protocol !== 'https:') {
      return null
    }

    const hostname = url.hostname.toLowerCase()
    const jrd = await fetchWebFinger(urlString, hostname)

    if (!jrd?.subject.toLowerCase().startsWith('acct:')) {
      return null
    }

    return `@${jrd.subject.slice('acct:'.length)}`
  } catch {
    return null
  }
}
