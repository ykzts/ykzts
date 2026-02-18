'use cache'

import { cacheTag } from 'next/cache'
import { supabase } from './client'

const POSTS_PER_PAGE = 10

type Profile = { id: string; name: string } | null

/**
 * Normalizes profile data from Supabase query results.
 * Supabase's `.select()` with foreign key joins can return either:
 * - An array of objects when using relational queries
 * - A single object when using direct queries
 * This function ensures consistent return type by extracting the first array element
 * and validates the profile object structure.
 */
function normalizeProfile(data: { profile?: unknown }): Profile {
  const profile = Array.isArray(data.profile) ? data.profile[0] : data.profile
  if (
    profile != null &&
    typeof profile === 'object' &&
    'id' in profile &&
    'name' in profile
  ) {
    return profile as Profile
  }
  return null
}

/**
 * Extracts version_date from the current_version field.
 * The current_version field from Supabase queries can be:
 * - An array containing version objects (when using foreign key joins)
 * - A single version object (when using direct queries)
 * This function handles both cases and returns the version_date field.
 */
function extractVersionDate(currentVersion: unknown): string | null {
  if (Array.isArray(currentVersion)) {
    return currentVersion[0]?.version_date ?? null
  }
  return (currentVersion as { version_date?: string })?.version_date ?? null
}

export async function getPosts(page = 1, isDraft = false) {
  cacheTag('posts')

  if (!supabase) {
    // Return empty array when Supabase is not configured (e.g., during build without env vars)
    return []
  }

  const safePage =
    typeof page === 'number' && Number.isFinite(page)
      ? Math.max(1, Math.floor(page))
      : 1
  const offset = (safePage - 1) * POSTS_PER_PAGE

  let query = supabase.from('posts').select(
    `
      id,
      slug,
      title,
      excerpt,
      tags,
      published_at,
      profile:profiles!posts_profile_id_fkey(
        id,
        name
      ),
      current_version:post_versions!posts_current_version_id_fkey(
        content,
        version_date
      )
    `
  )

  // In draft mode, show all posts including drafts and scheduled
  // In normal mode, only show published posts that are not in the future
  if (!isDraft) {
    query = query
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
  }

  const { data, error } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1)

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`)
  }

  return data.map((post) => ({
    content: Array.isArray(post.current_version)
      ? (post.current_version[0]?.content ?? null)
      : (post.current_version?.content ?? null),
    excerpt: post.excerpt,
    id: post.id,
    profile: normalizeProfile(post),
    published_at: post.published_at as string,
    slug: post.slug as string,
    tags: post.tags,
    title: post.title as string,
    version_date: extractVersionDate(post.current_version)
  }))
}

export async function getPostBySlug(slug: string, isDraft = false) {
  cacheTag('posts')

  if (!supabase) {
    // Return null when Supabase is not configured (e.g., during build without env vars)
    return null
  }

  let query = supabase
    .from('posts')
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      tags,
      published_at,
      profile:profiles!posts_profile_id_fkey(
        id,
        name
      ),
      current_version:post_versions!posts_current_version_id_fkey(
        content,
        version_date
      )
    `
    )
    .eq('slug', slug)

  // In draft mode, show any post regardless of status
  // In normal mode, only show published posts that are not in the future
  if (!isDraft) {
    query = query
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch post: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return {
    content: Array.isArray(data.current_version)
      ? (data.current_version[0]?.content ?? null)
      : (data.current_version?.content ?? null),
    excerpt: data.excerpt,
    id: data.id,
    profile: normalizeProfile(data),
    published_at: data.published_at as string,
    slug: data.slug as string,
    tags: data.tags,
    title: data.title as string,
    version_date: extractVersionDate(data.current_version)
  }
}

export async function getPostsByTag(tag: string, page = 1, isDraft = false) {
  cacheTag('posts')

  if (!supabase) {
    // Return empty array when Supabase is not configured (e.g., during build without env vars)
    return []
  }

  const safePage =
    typeof page === 'number' && Number.isFinite(page)
      ? Math.max(1, Math.floor(page))
      : 1
  const offset = (safePage - 1) * POSTS_PER_PAGE

  let query = supabase
    .from('posts')
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      tags,
      published_at,
      profile:profiles!posts_profile_id_fkey(
        id,
        name
      ),
      current_version:post_versions!posts_current_version_id_fkey(
        content,
        version_date
      )
    `
    )
    .contains('tags', [tag])

  // In draft mode, show all posts including drafts and scheduled
  // In normal mode, only show published posts that are not in the future
  if (!isDraft) {
    query = query
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
  }

  const { data, error } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1)

  if (error) {
    throw new Error(`Failed to fetch posts by tag: ${error.message}`)
  }

  return data.map((post) => ({
    content: Array.isArray(post.current_version)
      ? (post.current_version[0]?.content ?? null)
      : (post.current_version?.content ?? null),
    excerpt: post.excerpt,
    id: post.id,
    profile: normalizeProfile(post),
    published_at: post.published_at as string,
    slug: post.slug as string,
    tags: post.tags,
    title: post.title as string,
    version_date: extractVersionDate(post.current_version)
  }))
}

export async function getAllTags() {
  cacheTag('posts')

  if (!supabase) {
    // Return empty array when Supabase is not configured (e.g., during build without env vars)
    return []
  }

  const { data, error } = await supabase
    .from('posts')
    .select('tags')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .not('tags', 'is', null)

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`)
  }

  const allTags = data.flatMap((post) => post.tags || [])
  const uniqueTags = Array.from(new Set(allTags)).sort()

  return uniqueTags
}

export async function getAllPosts() {
  cacheTag('posts')

  if (!supabase) {
    // Return empty array when Supabase is not configured (e.g., during build without env vars)
    return []
  }

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      slug,
      published_at,
      current_version:post_versions!posts_current_version_id_fkey(
        version_date
      )
    `
    )
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .not('slug', 'is', null)
    .order('published_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch all posts: ${error.message}`)
  }

  return data.map((post) => ({
    published_at: post.published_at as string,
    slug: post.slug as string,
    version_date: extractVersionDate(post.current_version)
  }))
}

export async function getPostsForFeed(limit = 20) {
  cacheTag('posts')

  if (!supabase) {
    // Return empty array when Supabase is not configured (e.g., during build without env vars)
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
        version_date
      )
    `
    )
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .not('slug', 'is', null)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch posts for feed: ${error.message}`)
  }

  return data.map((post) => ({
    excerpt: post.excerpt,
    published_at: post.published_at as string,
    slug: post.slug as string,
    title: post.title as string,
    version_date: extractVersionDate(post.current_version)
  }))
}

export async function getTotalPostCount(isDraft = false) {
  cacheTag('posts')

  if (!supabase) {
    // Return 0 when Supabase is not configured (e.g., during build without env vars)
    return 0
  }

  let query = supabase.from('posts').select('*', { count: 'exact', head: true })

  // In draft mode, count all posts
  // In normal mode, only count published posts that are not in the future
  if (!isDraft) {
    query = query
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
  }

  const { count, error } = await query

  if (error) {
    throw new Error(`Failed to count posts: ${error.message}`)
  }

  return count ?? 0
}

export async function getTotalPages(isDraft = false) {
  const count = await getTotalPostCount(isDraft)
  return Math.ceil(count / POSTS_PER_PAGE)
}

export async function getPostCountByTag(tag: string, isDraft = false) {
  cacheTag('posts')

  if (!supabase) {
    // Return 0 when Supabase is not configured (e.g., during build without env vars)
    return 0
  }

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .contains('tags', [tag])

  // In draft mode, count all posts
  // In normal mode, only count published posts that are not in the future
  if (!isDraft) {
    query = query
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
  }

  const { count, error } = await query

  if (error) {
    throw new Error(`Failed to count posts by tag: ${error.message}`)
  }

  return count ?? 0
}

/**
 * Search posts using vector similarity search
 * @param query - Search query text
 * @param limit - Maximum number of results (default: 10)
 * @param threshold - Minimum similarity threshold (default: 0.4)
 * @returns Array of search results with similarity scores
 */
export async function searchPosts(query: string, limit = 10, threshold = 0.4) {
  cacheTag('posts')

  if (!supabase) {
    // Return empty array when Supabase is not configured
    return []
  }

  // Generate embedding for search query
  const { generateSearchEmbedding } = await import('@/lib/embeddings')
  const queryEmbedding = await generateSearchEmbedding(query)

  // Call database function to search for similar posts
  const { data, error } = await supabase.rpc('search_posts_by_embedding', {
    match_count: limit,
    match_threshold: threshold,
    query_embedding: JSON.stringify(queryEmbedding)
  })

  if (error) {
    throw new Error(`Failed to search posts: ${error.message}`)
  }

  return (
    (data as {
      excerpt: string | null
      id: string
      published_at: string
      similarity: number
      slug: string
      tags: string[] | null
      title: string
    }[]) || []
  )
}

/**
 * Get similar posts based on vector embedding similarity
 * @param postId - ID of the current post
 * @param limit - Maximum number of results (default: 5)
 * @param threshold - Minimum similarity threshold (default: 0.5)
 * @returns Array of similar posts with similarity scores
 */
export async function getSimilarPosts(
  postId: string,
  limit = 5,
  threshold = 0.5
) {
  cacheTag('posts')

  if (!supabase) {
    // Return empty array when Supabase is not configured
    return []
  }

  // Call database function to get similar posts
  const { data, error } = await supabase.rpc('get_similar_posts', {
    match_count: limit,
    match_threshold: threshold,
    post_id: postId
  })

  if (error) {
    throw new Error(`Failed to get similar posts: ${error.message}`)
  }

  return (
    (data as {
      excerpt: string | null
      id: string
      published_at: string
      similarity: number
      slug: string
      tags: string[] | null
      title: string
    }[]) || []
  )
}

/**
 * Get adjacent posts (previous and next) relative to the current post
 * @param currentSlug - Slug of the current post
 * @param isDraft - Whether to include draft posts (default: false)
 * @returns Object containing previous (older) and next (newer) posts
 */
export async function getAdjacentPosts(currentSlug: string, isDraft = false) {
  cacheTag('posts')

  if (!supabase) {
    return { nextPost: null, previousPost: null }
  }

  // First, get only the published_at date of the current post (lightweight query)
  let currentQuery = supabase
    .from('posts')
    .select('published_at')
    .eq('slug', currentSlug)

  if (!isDraft) {
    currentQuery = currentQuery
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
  }

  const { data: currentData, error: currentError } =
    await currentQuery.maybeSingle()

  if (currentError) {
    throw new Error(`Failed to fetch current post: ${currentError.message}`)
  }

  if (!currentData) {
    return { nextPost: null, previousPost: null }
  }

  const currentPublishedAt = currentData.published_at as string

  // Build base filters (apply same filters as getPostBySlug)
  const buildQuery = () => {
    // biome-ignore lint/style/noNonNullAssertion: supabase is guaranteed to be non-null at this point (checked at function start)
    let query = supabase!.from('posts').select(
      `
      slug,
      title,
      published_at
    `
    )

    if (!isDraft) {
      query = query
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
    }

    return query
  }

  // Get next post (newer, published_at >= current, excluding current post)
  const { data: nextData, error: nextError } = await buildQuery()
    .gte('published_at', currentPublishedAt)
    .neq('slug', currentSlug)
    .order('published_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (nextError) {
    throw new Error(`Failed to fetch next post: ${nextError.message}`)
  }

  // Get previous post (older, published_at <= current, excluding current post)
  const { data: prevData, error: prevError } = await buildQuery()
    .lte('published_at', currentPublishedAt)
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (prevError) {
    throw new Error(`Failed to fetch previous post: ${prevError.message}`)
  }

  return {
    nextPost: nextData
      ? {
          published_at: nextData.published_at as string,
          slug: nextData.slug as string,
          title: nextData.title as string
        }
      : null,
    previousPost: prevData
      ? {
          published_at: prevData.published_at as string,
          slug: prevData.slug as string,
          title: prevData.title as string
        }
      : null
  }
}

/**
 * Get the latest post's publication date
 * @param isDraft - Whether to include draft posts (default: false)
 * @returns The latest post's published_at date or null if no posts exist
 */
export async function getLatestPostDate(isDraft = false) {
  cacheTag('posts')

  if (!supabase) {
    return null
  }

  let query = supabase
    .from('posts')
    .select('published_at')
    .order('published_at', { ascending: false })
    .limit(1)

  if (!isDraft) {
    query = query
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch latest post date: ${error.message}`)
  }

  return data ? (data.published_at as string) : null
}

/**
 * Get posts published in a specific year
 * @param year - The year to filter posts by
 * @param isDraft - Whether to include draft posts (default: false)
 * @returns Array of posts published in the specified year
 */
export async function getPostsByYear(year: number, isDraft = false) {
  cacheTag('posts')

  if (!supabase) {
    return []
  }

  const yearStart = `${year}-01-01T00:00:00.000Z`
  const yearEnd = `${year}-12-31T23:59:59.999Z`

  let query = supabase
    .from('posts')
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      tags,
      published_at,
      profile:profiles!posts_profile_id_fkey(
        id,
        name
      ),
      current_version:post_versions!posts_current_version_id_fkey(
        content,
        version_date
      )
    `
    )
    .gte('published_at', yearStart)
    .lte('published_at', yearEnd)

  if (!isDraft) {
    query = query
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
  }

  const { data, error } = await query.order('published_at', {
    ascending: false
  })

  if (error) {
    throw new Error(`Failed to fetch posts by year: ${error.message}`)
  }

  return data.map((post) => ({
    content: Array.isArray(post.current_version)
      ? (post.current_version[0]?.content ?? null)
      : (post.current_version?.content ?? null),
    excerpt: post.excerpt,
    id: post.id,
    profile: normalizeProfile(post),
    published_at: post.published_at as string,
    slug: post.slug as string,
    tags: post.tags,
    title: post.title as string,
    version_date: extractVersionDate(post.current_version)
  }))
}

/**
 * Get the number of posts published in a specific year
 * @param year - The year to count posts for
 * @param isDraft - Whether to include draft posts (default: false)
 * @returns The number of posts published in the specified year
 */
export async function getPostCountByYear(year: number, isDraft = false) {
  cacheTag('posts')

  if (!supabase) {
    return 0
  }

  const yearStart = `${year}-01-01T00:00:00.000Z`
  const yearEnd = `${year}-12-31T23:59:59.999Z`

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .gte('published_at', yearStart)
    .lte('published_at', yearEnd)

  if (!isDraft) {
    query = query
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
  }

  const { count, error } = await query

  if (error) {
    throw new Error(`Failed to count posts by year: ${error.message}`)
  }

  return count ?? 0
}

export { POSTS_PER_PAGE }
