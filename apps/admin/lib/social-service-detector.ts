// Known social service mappings based on hostnames
const KNOWN_SERVICES: Record<string, string> = {
  'facebook.com': 'facebook',
  'fb.com': 'facebook',
  'fedibird.com': 'mastodon',
  'github.com': 'github',
  'mastodon.social': 'mastodon',
  'mstdn.jp': 'mastodon',
  'pawoo.net': 'mastodon',
  'threads.net': 'threads',
  'twitter.com': 'x',
  'x.com': 'x'
}

/**
 * Detect social service from URL hostname
 */
export async function detectServiceFromURL(
  urlString: string
): Promise<string | null> {
  try {
    const url = new URL(urlString)
    const hostname = url.hostname.toLowerCase()

    // Check known services first
    if (hostname in KNOWN_SERVICES) {
      return KNOWN_SERVICES[hostname]
    }

    // Check if it's a subdomain of a known service
    for (const [knownHost, service] of Object.entries(KNOWN_SERVICES)) {
      if (hostname.endsWith(`.${knownHost}`)) {
        return service
      }
    }

    // Try NodeInfo for Fediverse instances
    const nodeInfoService = await tryNodeInfo(url.origin)
    if (nodeInfoService) {
      return nodeInfoService
    }

    // Unknown service
    return null
  } catch {
    // Invalid URL
    return null
  }
}

/**
 * Try to detect service using NodeInfo protocol
 * @see https://github.com/jhass/nodeinfo/blob/main/PROTOCOL.md
 */
async function tryNodeInfo(origin: string): Promise<string | null> {
  try {
    // Step 1: Fetch .well-known/nodeinfo
    const wellKnownResponse = await fetch(`${origin}/.well-known/nodeinfo`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000)
    })

    if (!wellKnownResponse.ok) {
      return null
    }

    const wellKnown = await wellKnownResponse.json()
    const links = wellKnown.links as Array<{ rel: string; href: string }>

    if (!Array.isArray(links)) {
      return null
    }

    // Step 2: Find NodeInfo 2.0 or 2.1 endpoint
    const nodeInfoLink = links.find(
      (link) =>
        link.rel === 'http://nodeinfo.diaspora.software/ns/schema/2.1' ||
        link.rel === 'http://nodeinfo.diaspora.software/ns/schema/2.0'
    )

    if (!nodeInfoLink?.href) {
      return null
    }

    // Validate that NodeInfo endpoint shares the same origin (SSRF protection)
    try {
      const nodeInfoUrl = new URL(nodeInfoLink.href)
      if (nodeInfoUrl.origin !== origin) {
        return null
      }
    } catch {
      return null
    }

    // Step 3: Fetch NodeInfo
    const nodeInfoResponse = await fetch(nodeInfoLink.href, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000)
    })

    if (!nodeInfoResponse.ok) {
      return null
    }

    const nodeInfo = await nodeInfoResponse.json()
    const software = nodeInfo.software as { name?: string }

    if (!software?.name) {
      return null
    }

    // Map software name to service
    const softwareName = software.name.toLowerCase()
    if (
      softwareName === 'mastodon' ||
      softwareName === 'pleroma' ||
      softwareName === 'misskey' ||
      softwareName === 'firefish'
    ) {
      return 'mastodon' // Use mastodon for all Fediverse instances
    }

    return null
  } catch {
    // NodeInfo fetch failed or timeout
    return null
  }
}
