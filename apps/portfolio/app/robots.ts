import { type MetadataRoute } from 'next'
import { metadata } from '@/app/layout'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: '/',
        userAgent: '*'
      }
    ],
    sitemap: metadata.metadataBase
      ? new URL('/sitemap.xml', metadata.metadataBase).toString()
      : undefined
  }
}
