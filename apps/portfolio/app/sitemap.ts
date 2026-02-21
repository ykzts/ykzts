import { getSiteOrigin } from '@ykzts/site-config'
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteOrigin = getSiteOrigin()

  return [
    {
      changeFrequency: 'monthly',
      priority: 0.8,
      url: new URL('/', siteOrigin).toString()
    },
    {
      changeFrequency: 'yearly',
      priority: 0.1,
      url: new URL('/privacy', siteOrigin).toString()
    }
  ]
}
