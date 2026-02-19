import type { MetadataRoute } from 'next'
import { metadata } from '@/app/layout'

export default function robots(): MetadataRoute.Robots {
  const { metadataBase: baseUrl } = metadata
  const sitemap = baseUrl
    ? ['/sitemap.xml', '/blog/sitemap.xml'].map((path) =>
        new URL(path, baseUrl).toString()
      )
    : []

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
