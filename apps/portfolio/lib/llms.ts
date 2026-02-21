import {
  getPortfolioDescription,
  getSiteName,
  getSiteOrigin
} from '@ykzts/site-config'

export function getLlmsHeaderLines(): string[] {
  const siteName = getSiteName()
  const portfolioDescription = getPortfolioDescription()

  return [
    `# ${siteName}`,
    '',
    `> ${portfolioDescription}`,
    '',
    'このサイトは、ポートフォリオと技術ブログを統合したサービスです。'
  ]
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
