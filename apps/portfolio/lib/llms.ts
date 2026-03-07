import {
  getPortfolioDescription,
  getSiteName,
  getSiteOrigin
} from '@ykzts/site-config'

type SocialLink = {
  service: string | null
  url: string | null
}

type ProfileTechnology = {
  technology: { name: string } | null
}

export type ProfileForHeader = {
  aboutMarkdown?: string | null
  name?: string | null
  occupation?: string | null
  profile_technologies?: readonly ProfileTechnology[] | null
  social_links?: readonly SocialLink[] | null
  tagline?: string | null
}

export function getLlmsHeaderLines(
  profile?: ProfileForHeader | null
): string[] {
  const siteName = getSiteName()
  const portfolioDescription = getPortfolioDescription()

  const lines = [
    `# ${siteName}`,
    '',
    `> ${portfolioDescription}`,
    '',
    'このサイトは、ポートフォリオと技術ブログを統合したサービスです。'
  ]

  if (!profile) {
    return lines
  }

  const profileLines: string[] = []
  if (profile.name) {
    profileLines.push(`- **Name**: ${profile.name}`)
  }
  if (profile.occupation) {
    profileLines.push(`- **Occupation**: ${profile.occupation}`)
  }
  if (profile.tagline) {
    profileLines.push(`- **Tagline**: ${profile.tagline}`)
  }
  if (profileLines.length > 0) {
    lines.push('', '## Profile', '', ...profileLines)
  }

  const technologies = profile.profile_technologies
    ?.map((t) => t.technology?.name)
    .filter((n): n is string => !!n)
  if (technologies && technologies.length > 0) {
    lines.push('', '## Technologies', '', technologies.join(', '))
  }

  const socialLinks = profile.social_links?.flatMap((l) => {
    if (typeof l.url !== 'string') {
      return []
    }

    const rawUrl = l.url.trim()
    if (!rawUrl) {
      return []
    }

    try {
      const parsed = new URL(rawUrl)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return []
      }

      const service =
        typeof l.service === 'string' && l.service.trim() !== ''
          ? l.service.trim()
          : null
      return [{ service, url: parsed.toString() }]
    } catch {
      return []
    }
  })
  if (socialLinks && socialLinks.length > 0) {
    lines.push('', '## Social Links', '')
    for (const link of socialLinks) {
      const label = link.service ?? link.url
      lines.push(`- [${label}](${link.url})`)
    }
  }

  if (profile.aboutMarkdown) {
    lines.push('', '## About', '', profile.aboutMarkdown)
  }

  return lines
}

export function buildWorkUrl(slug: string): string {
  const siteOrigin = getSiteOrigin()
  return new URL(`/#${slug}`, siteOrigin).toString()
}

export function buildPostUrl(slug: string, publishedAt: string): string {
  const siteOrigin = getSiteOrigin()
  const date = new Date(publishedAt)
  const year = String(date.getUTCFullYear())
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return new URL(
    `/blog/${year}/${month}/${day}/${encodeURIComponent(slug)}`,
    siteOrigin
  ).toString()
}
