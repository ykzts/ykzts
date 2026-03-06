import type { PortableTextBlock } from '@portabletext/types'
import { createBrowserClient } from '@ykzts/supabase/client'
import { cacheTag } from 'next/cache'
import { isPortableTextValue } from '@/lib/portable-text'

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createBrowserClient()
    : null

export async function getProfile() {
  'use cache'

  cacheTag('profile')

  if (!supabase) {
    throw new Error(
      'Supabase is not properly configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    )
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(
      `
        id,
        name,
        occupation,
        tagline,
        about,
        email,
        fediverse_creator,
        avatar_url,
        social_links(url, service),
        profile_technologies(sort_order, technology:technologies(name)),
        key_visual:key_visuals(id, url, width, height, artist_name, artist_url, attribution, alt_text)
      `
    )
    .order('sort_order', {
      ascending: true,
      referencedTable: 'profile_technologies'
    })
    .maybeSingle()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  if (!profileData) {
    throw new Error('Profile not found')
  }

  let aboutRaw = profileData.about

  if (typeof aboutRaw === 'string') {
    try {
      aboutRaw = JSON.parse(aboutRaw)
    } catch {
      aboutRaw = null
    }
  }

  const about = isPortableTextValue(aboutRaw) ? aboutRaw : null

  return {
    ...profileData,
    about
  }
}

export async function getWorks() {
  'use cache'

  cacheTag('works')

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('works')
    .select(
      `
        content,
        slug,
        title,
        starts_at,
        work_urls(id, label, url, sort_order),
        work_technologies(technology_id, technology:technologies(name))
      `
    )
    .order('starts_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch works: ${error.message}`)
  }

  return data.map((work) => {
    const workUrls = Array.isArray(work.work_urls)
      ? [...work.work_urls].sort((a, b) => a.sort_order - b.sort_order)
      : []
    const workTechnologies = Array.isArray(work.work_technologies)
      ? work.work_technologies
      : []

    return {
      ...work,
      content: isPortableTextValue(work.content) ? work.content : null,
      work_technologies: workTechnologies,
      work_urls: workUrls
    }
  })
}

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
