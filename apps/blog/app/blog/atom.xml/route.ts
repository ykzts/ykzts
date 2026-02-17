import { Feed } from 'feed'
import { metadata } from '@/app/layout'
import { DEFAULT_POST_TITLE } from '@/lib/constants'
import { getPostsForFeed } from '@/lib/supabase/posts'

export async function GET() {
  const posts = await getPostsForFeed(20)

  if (!metadata.metadataBase) {
    return new Response('Feed configuration error', { status: 500 })
  }

  const baseUrl = new URL('/blog', metadata.metadataBase).toString()

  const feed = new Feed({
    author: {
      email: 'ykzts@desire.sh',
      name: 'Yamagishi Kazutoshi'
    },
    copyright: `Copyright © ${new Date().getFullYear()} Yamagishi Kazutoshi`,
    description: 'Blog',
    favicon: new URL('/favicon.ico', metadata.metadataBase).toString(),
    feedLinks: {
      atom: new URL('/blog/atom.xml', metadata.metadataBase).toString()
    },
    id: baseUrl,
    link: baseUrl,
    title: 'Blog'
  })

  for (const post of posts) {
    const publishedDate = new Date(post.published_at)
    const year = String(publishedDate.getUTCFullYear())
    const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(publishedDate.getUTCDate()).padStart(2, '0')
    const postUrl = new URL(
      `/blog/${year}/${month}/${day}/${encodeURIComponent(post.slug)}`,
      metadata.metadataBase
    ).toString()

    feed.addItem({
      date: new Date(post.published_at),
      description: post.excerpt || undefined,
      id: postUrl,
      link: postUrl,
      published: new Date(post.published_at),
      title: post.title || DEFAULT_POST_TITLE
    })
  }

  return new Response(feed.atom1(), {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8'
    }
  })
}
