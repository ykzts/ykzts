import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
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

function isPrivateIPv4(address: string): boolean {
  const octets = address.split('.').map((segment) => Number(segment))

  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet))) {
    return true
  }

  if (octets[0] === 10) return true
  if (octets[0] === 127) return true
  if (octets[0] === 169 && octets[1] === 254) return true
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true
  if (octets[0] === 192 && octets[1] === 168) return true
  if (address === '169.254.169.254') return true

  return false
}

function isPrivateIPv6(address: string): boolean {
  const normalized = address.toLowerCase()

  if (normalized === '::1') return true

  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true

  if (
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return true
  }

  if (normalized.startsWith('::ffff:')) {
    return isPrivateIPv4(normalized.replace('::ffff:', ''))
  }

  return false
}

function isPublicIpAddress(address: string): boolean {
  const ipVersion = isIP(address)

  if (ipVersion === 4) return !isPrivateIPv4(address)
  if (ipVersion === 6) return !isPrivateIPv6(address)

  return false
}

async function isSafeDomain(domain: string): Promise<boolean> {
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
  acct: string,
  domain: string
): Promise<WebFingerJrd | null> {
  try {
    if (!(await isSafeDomain(domain))) {
      return null
    }

    const url = new URL(`https://${domain}/.well-known/webfinger`)
    url.searchParams.set('resource', `acct:${acct}`)

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/jrd+json, application/json' },
      signal: AbortSignal.timeout(5000)
    })

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
 * Parse a Fediverse handle in `@user@domain` or `user@domain` format.
 * Returns the parsed components or null if the format is invalid.
 */
export function parseFediverseHandle(value: string): {
  acct: string
  domain: string
  normalized: string
} | null {
  const trimmed = value.trim()
  const match = trimmed.match(/^@?([^@\s]+)@([^@\s]+)$/)

  if (!match) {
    return null
  }

  const username = match[1]
  const domain = match[2].toLowerCase()

  if (!isValidPublicHostname(domain)) {
    return null
  }

  const acct = `${username}@${domain}`

  return { acct, domain, normalized: `@${acct}` }
}

/**
 * Verify that a Fediverse account exists by querying the WebFinger endpoint.
 * Checks both `subject` and `aliases` in the JRD response.
 */
export async function verifyFediverseHandle(
  acct: string,
  domain: string
): Promise<boolean> {
  const jrd = await fetchWebFinger(acct, domain)

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
 * Resolve a Fediverse account handle from a URL using WebFinger.
 * Returns the canonical `@user@domain` handle, or null if the URL
 * does not match the `/@username` pattern or WebFinger resolution fails.
 */
export async function extractFediverseHandleFromURL(
  urlString: string
): Promise<string | null> {
  try {
    const url = new URL(urlString)

    if (url.protocol !== 'https:') {
      return null
    }

    const match = url.pathname.match(/^\/@([^/]+)/)

    if (!match?.[1]) {
      return null
    }

    const hostname = url.hostname.toLowerCase()
    const acct = `${match[1]}@${hostname}`
    const jrd = await fetchWebFinger(acct, hostname)

    if (!jrd?.subject.startsWith('acct:')) {
      return null
    }

    return `@${jrd.subject.slice('acct:'.length)}`
  } catch {
    return null
  }
}
