import type { PortableTextBlock } from '@portabletext/types'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@ykzts/supabase'
import { cacheTag } from 'next/cache'
import { isPortableTextValue } from '@/lib/portable-text'

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
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
        technologies(name)
      `
    )
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
    .select('content, slug, title, starts_at')
    .order('starts_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch works: ${error.message}`)
  }

  return data.map((work) => ({
    ...work,
    content: isPortableTextValue(work.content) ? work.content : null
  }))
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
