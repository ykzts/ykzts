import { portableTextToHTML } from '@ykzts/portable-text-utils'
import { getSiteOrigin } from '@ykzts/site-config'
import { Feed } from 'feed'
import { DEFAULT_POST_TITLE } from '@/lib/constants'
import { getPostsForFeed } from '@/lib/supabase/posts'
import { getPublisherProfile } from '@/lib/supabase/profiles'

export async function GET() {
  const [posts, profile] = await Promise.all([
    getPostsForFeed(20),
    getPublisherProfile()
  ])

  const siteOrigin = getSiteOrigin()
  const baseUrl = new URL('/blog', siteOrigin).toString()
  const profileName = profile.name

  const feed = new Feed({
    author: {
      name: profileName
    },
    copyright: `Copyright © ${new Date().getFullYear()} ${profileName}`,
    description: 'Blog',
    favicon: new URL('/favicon.ico', siteOrigin).toString(),
    feedLinks: {
      atom: new URL('/blog/atom.xml', siteOrigin).toString()
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
      siteOrigin
    ).toString()

    feed.addItem({
      content: portableTextToHTML(post.content),
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
