'use cache'

import { cacheTag } from 'next/cache'
import type { MetadataRoute } from 'next'
import { getAllPosts, getAllTags } from '@/lib/supabase/posts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  cacheTag('posts')

  const posts = await getAllPosts()
  const tags = await getAllTags()

  const baseUrl = 'https://ykzts.com/blog'

  // Homepage entry
  const homepageEntry: MetadataRoute.Sitemap[number] = {
    changeFrequency: 'daily',
    lastModified: new Date(),
    priority: 1.0,
    url: baseUrl
  }

  // Post detail pages
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const publishedDate = new Date(post.published_at)
    const year = String(publishedDate.getUTCFullYear())
    const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(publishedDate.getUTCDate()).padStart(2, '0')

    return {
      changeFrequency: 'monthly',
      lastModified: new Date(post.updated_at),
      priority: 0.8,
      url: `${baseUrl}/${year}/${month}/${day}/${post.slug}`
    }
  })

  // Tag archive pages
  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    changeFrequency: 'monthly',
    lastModified: new Date(),
    priority: 0.6,
    url: `${baseUrl}/tags/${encodeURIComponent(tag)}`
  }))

  return [homepageEntry, ...postEntries, ...tagEntries]
}
