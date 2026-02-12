'use cache'

import { cacheTag } from 'next/cache'
import { supabase } from './client'

const POSTS_PER_PAGE = 10

export async function getPosts(page = 1) {
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

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      tags,
      published_at,
      current_version:post_versions!posts_current_version_id_fkey(
        content
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
    content: Array.isArray(post.current_version)
      ? (post.current_version[0]?.content ?? null)
      : (post.current_version?.content ?? null),
    excerpt: post.excerpt,
    id: post.id,
    published_at: post.published_at as string,
    slug: post.slug as string,
    tags: post.tags,
    title: post.title as string
  }))
}

export async function getPostBySlug(slug: string) {
  cacheTag('posts')

  if (!supabase) {
    // Return null when Supabase is not configured (e.g., during build without env vars)
    return null
  }

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      tags,
      published_at,
      current_version:post_versions!posts_current_version_id_fkey(
        content
      )
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle()

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
    published_at: data.published_at as string,
    slug: data.slug as string,
    tags: data.tags,
    title: data.title as string
  }
}

export async function getPostsByTag(tag: string, page = 1) {
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

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      tags,
      published_at,
      current_version:post_versions!posts_current_version_id_fkey(
        content
      )
    `
    )
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .contains('tags', [tag])
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
    published_at: post.published_at as string,
    slug: post.slug as string,
    tags: post.tags,
    title: post.title as string
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
    .select('slug, published_at, updated_at')
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
    updated_at: post.updated_at as string
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
    .select('slug, title, excerpt, published_at, updated_at')
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
    updated_at: post.updated_at as string
  }))
}

export async function getTotalPostCount() {
  cacheTag('posts')

  if (!supabase) {
    // Return 0 when Supabase is not configured (e.g., during build without env vars)
    return 0
  }

  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())

  if (error) {
    throw new Error(`Failed to count posts: ${error.message}`)
  }

  return count ?? 0
}

export async function getTotalPages() {
  const count = await getTotalPostCount()
  return Math.ceil(count / POSTS_PER_PAGE)
}

export async function getPostCountByTag(tag: string) {
  cacheTag('posts')

  if (!supabase) {
    // Return 0 when Supabase is not configured (e.g., during build without env vars)
    return 0
  }

  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .contains('tags', [tag])

  if (error) {
    throw new Error(`Failed to count posts by tag: ${error.message}`)
  }

  return count ?? 0
}

export { POSTS_PER_PAGE }
