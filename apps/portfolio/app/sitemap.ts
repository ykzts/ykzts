import type { MetadataRoute } from 'next'
import { metadata } from '@/app/layout'

export default function sitemap(): MetadataRoute.Sitemap {
  if (!metadata.metadataBase) {
    return []
  }

  return [
    {
      changeFrequency: 'monthly',
      priority: 0.8,
      url: new URL('/', metadata.metadataBase).toString()
    }
  ]
}
