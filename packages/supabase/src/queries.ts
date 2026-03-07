import type { PortableTextBlock } from '@portabletext/types'
import { cacheTag } from 'next/cache'
import { createBrowserClient } from './client'
import type { Post, PostAuthor, PostSummary, Profile, Work } from './dto'

const POSTS_PER_PAGE = 10

function createSupabaseClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null
  }
  return createBrowserClient()
}

function isPortableTextValue(value: unknown): value is PortableTextBlock[] {
  if (!Array.isArray(value)) {
    return false
  }

  return value.every((item) => {
    if (!item || typeof item !== 'object') {
      return false
    }

    const type = (item as { _type?: unknown })._type

    return typeof type === 'string'
  })
}

function normalizePostAuthor(data: { profile?: unknown }): Post['profile'] {
  const profile = Array.isArray(data.profile) ? data.profile[0] : data.profile
  if (
    profile != null &&
    typeof profile === 'object' &&
    'id' in profile &&
    'name' in profile
  ) {
    return profile as Post['profile']
  }
  return null
}

function extractVersionDate(currentVersion: unknown): string | null {
  if (Array.isArray(currentVersion)) {
    return currentVersion[0]?.version_date ?? null
  }
  return (currentVersion as { version_date?: string })?.version_date ?? null
}

function extractVersionContent(
  currentVersion: unknown
): PortableTextBlock[] | null {
  const content = Array.isArray(currentVersion)
    ? (currentVersion[0]?.content ?? null)
    : ((currentVersion as { content?: unknown } | null)?.content ?? null)
  return isPortableTextValue(content) ? content : null
}

function normalizePage(page: number): number {
  return typeof page === 'number' && Number.isFinite(page)
    ? Math.max(1, Math.floor(page))
    : 1
}

/**
 * Fetches the site publisher's profile.
 *
 * Unlike `getWorks` and `getPosts`, this function throws when Supabase is not
 * configured, because a missing profile is a critical error (no sensible
 * default exists). Callers that can tolerate failure should catch the error
 * themselves (e.g. `getProfile().catch(() => null)`).
 */
export async function getProfile(): Promise<Profile> {
  'use cache'

  cacheTag('profile')

  const supabase = createSupabaseClient()

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

  const social_links = Array.isArray(profileData.social_links)
    ? profileData.social_links
    : []
  const profile_technologies = Array.isArray(profileData.profile_technologies)
    ? profileData.profile_technologies
    : []
  const key_visual = Array.isArray(profileData.key_visual)
    ? (profileData.key_visual[0] ?? null)
    : profileData.key_visual

  return {
    ...profileData,
    about,
    key_visual,
    profile_technologies,
    social_links
  }
}

/**
 * Fetches all works ordered by start date descending.
 *
 * Returns an empty array when Supabase is not configured, so pages that list
 * works can still render without a profile dependency.
 */
export async function getWorks(): Promise<Work[]> {
  'use cache'

  cacheTag('works')

  const supabase = createSupabaseClient()

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
    const work_urls = Array.isArray(work.work_urls)
      ? [...work.work_urls].sort((a, b) => a.sort_order - b.sort_order)
      : []
    const work_technologies = Array.isArray(work.work_technologies)
      ? work.work_technologies
      : []

    return {
      ...work,
      content: isPortableTextValue(work.content) ? work.content : null,
      work_technologies,
      work_urls
    }
  })
}

/**
 * Fetches published posts for a given page, ordered by publication date descending.
 *
 * Returns an empty array when Supabase is not configured, so listing pages can
 * still render without a profile dependency.
 */
export async function getPosts(page = 1): Promise<Post[]> {
  'use cache'

  cacheTag('posts')

  const supabase = createSupabaseClient()

  if (!supabase) {
    return []
  }

  const safePage = normalizePage(page)
  const offset = (safePage - 1) * POSTS_PER_PAGE

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
        id,
        slug,
        title,
        excerpt,
        tags,
        status,
        published_at,
        profile:profiles!posts_profile_id_fkey(
          id,
          name,
          fediverse_creator
        ),
        current_version:post_versions!posts_current_version_id_fkey(
          content,
          version_date
        )
      `
    )
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1)

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`)
  }

  return data.map((post) => ({
    content: extractVersionContent(post.current_version),
    excerpt: post.excerpt,
    id: post.id,
    profile: normalizePostAuthor(post),
    published_at: post.published_at as string | null,
    slug: post.slug as string,
    status: post.status as string,
    tags: post.tags,
    title: post.title as string,
    version_date: extractVersionDate(post.current_version)
  }))
}

export { POSTS_PER_PAGE }
export type { Post, PostAuthor, PostSummary, Profile, Work }
