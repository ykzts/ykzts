import { getSiteOrigin } from '@ykzts/site-config'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteOrigin = getSiteOrigin()
  const sitemap = ['/sitemap.xml', '/blog/sitemap.xml'].map((path) =>
    new URL(path, siteOrigin).toString()
  )

  return {
    rules: [
      {
        allow: '/',
        userAgent: '*'
      }
    ],
    sitemap
  }
}
