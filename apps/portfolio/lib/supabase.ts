import type { PortableTextBlock } from '@portabletext/types'
import { createBrowserClient } from '@ykzts/supabase/client'
import { cacheTag } from 'next/cache'

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createBrowserClient()
    : null

export async function getPostsForLlms() {
  'use cache'

  cacheTag('posts')

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('posts')
    .select('slug, title, excerpt, published_at')
    .eq('status', 'published')
    .not('slug', 'is', null)
    .not('title', 'is', null)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`)
  }

  return data.map((post) => ({
    excerpt: post.excerpt,
    published_at: post.published_at as string,
    slug: post.slug as string,
    title: post.title as string
  }))
}

export async function getPostsForLlmsFull() {
  'use cache'

  cacheTag('posts')

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      slug,
      title,
      excerpt,
      published_at,
      current_version:post_versions!posts_current_version_id_fkey(
        content
      )
    `
    )
    .eq('status', 'published')
    .not('slug', 'is', null)
    .not('title', 'is', null)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`)
  }

  return data.map((post) => ({
    content: (Array.isArray(post.current_version)
      ? (post.current_version[0]?.content ?? null)
      : (post.current_version?.content ?? null)) as PortableTextBlock[] | null,
    excerpt: post.excerpt,
    published_at: post.published_at as string,
    slug: post.slug as string,
    title: post.title as string
  }))
}
