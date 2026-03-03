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

  const [a, b, c] = octets

  if (a === 0) return true // 0.0.0.0/8 - "This" network
  if (a === 10) return true // 10.0.0.0/8 - Private
  if (a === 100 && b >= 64 && b <= 127) return true // 100.64.0.0/10 - Shared (CGNAT)
  if (a === 127) return true // 127.0.0.0/8 - Loopback
  if (a === 169 && b === 254) return true // 169.254.0.0/16 - Link-local
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12 - Private
  if (a === 192 && b === 0 && c === 0) return true // 192.0.0.0/24 - IETF Protocol Assignments
  if (a === 192 && b === 0 && c === 2) return true // 192.0.2.0/24 - TEST-NET-1
  if (a === 192 && b === 88 && c === 99) return true // 192.88.99.0/24 - 6to4 Relay Anycast
  if (a === 192 && b === 168) return true // 192.168.0.0/16 - Private
  if (a === 198 && b >= 18 && b <= 19) return true // 198.18.0.0/15 - Benchmarking
  if (a === 198 && b === 51 && c === 100) return true // 198.51.100.0/24 - TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return true // 203.0.113.0/24 - TEST-NET-3
  if (a >= 224) return true // 224.0.0.0/4 Multicast and 240.0.0.0/4 Reserved

  return false
}

function isPrivateIPv6(address: string): boolean {
  const normalized = address.toLowerCase()

  if (normalized === '::') return true // Unspecified address

  if (normalized === '::1') return true // Loopback

  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true // Unique local

  if (
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return true // Link-local
  }

  if (normalized.startsWith('ff')) return true // Multicast

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
