import type { Database, Json } from '@ykzts/supabase'
import { cacheTag } from 'next/cache'
import { getCurrentUser } from './auth'
import { createClient } from './supabase/server'

type Post = Database['public']['Tables']['posts']['Row']
type PostVersion = Database['public']['Tables']['post_versions']['Row']

export type PostWithDetails = Post & {
  current_version?: {
    content: Json
  } | null
  profile?: {
    name: string | null
  } | null
}

export type PostsFilter = {
  page?: number
  perPage?: number
  search?: string
  status?: 'draft' | 'scheduled' | 'published' | 'all'
}

export type PostVersionWithProfile = PostVersion & {
  profile?: {
    name: string | null
  } | null
}

/**
 * Get posts list with filtering, search, and pagination
 */
export async function getPosts(filter: PostsFilter = {}) {
  'use cache: private'
  cacheTag('posts')

  let { page = 1, perPage = 20, search, status = 'all' } = filter

  // Validate pagination inputs
  if (!Number.isFinite(page) || page < 1) page = 1
  if (!Number.isFinite(perPage) || perPage < 1) perPage = 20

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('認証されていません')
  }

  const supabase = await createClient()

  // Get the authenticated user's profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`プロフィールの取得に失敗しました: ${profileError.message}`)
  }

  if (!profileData) {
    throw new Error('プロフィールが見つかりません')
  }

  let query = supabase
    .from('posts')
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      status,
      published_at,
      created_at,
      updated_at,
      profile:profiles!posts_profile_id_fkey(name)
    `,
      { count: 'exact' }
    )
    .eq('profile_id', profileData.id)

  // Apply status filter
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Apply search filter (excerpt only - title search disabled for Japanese text incompatibility)
  if (search?.trim()) {
    // Escape special characters to prevent SQL injection in LIKE patterns
    const escapedSearch = search
      .trim()
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_')
    query = query.ilike('excerpt', `%${escapedSearch}%`)
  }

  // Apply pagination
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  query = query.range(from, to)

  // Order by created_at descending
  query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query

  if (error) {
    throw new Error(`投稿の取得に失敗しました: ${error.message}`)
  }

  return {
    count: count ?? 0,
    data: data ?? [],
    page,
    perPage,
    totalPages: Math.ceil((count ?? 0) / perPage)
  }
}

/**
 * Get a single post by ID with full details
 */
export async function getPostById(id: string): Promise<PostWithDetails | null> {
  'use cache: private'
  cacheTag('posts')

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('認証されていません')
  }

  const supabase = await createClient()

  // Get the authenticated user's profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`プロフィールの取得に失敗しました: ${profileError.message}`)
  }

  if (!profileData) {
    return null
  }

  // Fetch post with current version and profile info
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      current_version:post_versions!posts_current_version_id_fkey(content),
      profile:profiles!posts_profile_id_fkey(name)
    `)
    .eq('id', id)
    .eq('profile_id', profileData.id)
    .maybeSingle()

  if (error) {
    throw new Error(`投稿の取得に失敗しました: ${error.message}`)
  }

  return data
}

/**
 * Create a new post using the database function
 */
export async function createPost(params: {
  changeSummary?: string
  content: Json
  excerpt?: string
  publishedAt?: string
  slug: string
  status?: 'draft' | 'scheduled' | 'published'
  tags?: string[]
  title: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('create_post', {
    p_content: params.content,
    p_excerpt: params.excerpt || '',
    p_published_at: params.publishedAt,
    p_slug: params.slug,
    p_status: params.status,
    p_tags: params.tags,
    p_title: params.title
  })

  if (error) {
    throw new Error(`投稿の作成に失敗しました: ${error.message}`)
  }

  return data
}

/**
 * Update an existing post using the database function
 */
export async function updatePost(params: {
  changeSummary?: string
  content?: Json
  excerpt?: string
  postId: string
  publishedAt?: string
  slug?: string
  status?: 'draft' | 'scheduled' | 'published'
  tags?: string[]
  title?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('update_post', {
    p_change_summary: params.changeSummary,
    p_content: params.content,
    p_excerpt: params.excerpt,
    p_post_id: params.postId,
    p_published_at: params.publishedAt,
    p_slug: params.slug,
    p_status: params.status,
    p_tags: params.tags,
    p_title: params.title
  })

  if (error) {
    throw new Error(`投稿の更新に失敗しました: ${error.message}`)
  }

  return data
}

/**
 * Delete a post using the database function
 */
export async function deletePost(postId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('delete_post', {
    p_post_id: postId
  })

  if (error) {
    throw new Error(`投稿の削除に失敗しました: ${error.message}`)
  }
}

/**
 * Get all versions for a post
 */
export async function getPostVersions(
  postId: string
): Promise<PostVersionWithProfile[]> {
  'use cache: private'
  cacheTag('posts')

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('認証されていません')
  }

  const supabase = await createClient()

  // Get the authenticated user's profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`プロフィールの取得に失敗しました: ${profileError.message}`)
  }

  if (!profileData) {
    throw new Error('プロフィールが見つかりません')
  }

  // Verify post ownership first
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, profile_id')
    .eq('id', postId)
    .eq('profile_id', profileData.id)
    .maybeSingle()

  if (postError) {
    throw new Error(`投稿の確認に失敗しました: ${postError.message}`)
  }

  if (!post) {
    throw new Error('投稿にアクセス権がありません')
  }

  const { data, error } = await supabase
    .from('post_versions')
    .select(`
      *,
      profile:profiles!post_versions_created_by_fkey(name)
    `)
    .eq('post_id', postId)
    .order('version_number', { ascending: false })

  if (error) {
    throw new Error(`バージョン履歴の取得に失敗しました: ${error.message}`)
  }

  return data ?? []
}

/**
 * Get a specific version
 */
export async function getPostVersion(
  versionId: string
): Promise<PostVersionWithProfile | null> {
  'use cache: private'
  cacheTag('posts')

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('認証されていません')
  }

  const supabase = await createClient()

  // Get the authenticated user's profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`プロフィールの取得に失敗しました: ${profileError.message}`)
  }

  if (!profileData) {
    throw new Error('プロフィールが見つかりません')
  }

  const { data, error } = await supabase
    .from('post_versions')
    .select(`
      *,
      post:posts!post_versions_post_id_fkey(profile_id),
      profile:profiles!post_versions_created_by_fkey(name)
    `)
    .eq('id', versionId)
    .maybeSingle()

  if (error) {
    throw new Error(`バージョンの取得に失敗しました: ${error.message}`)
  }

  if (!data) {
    return null
  }

  // Verify post ownership
  const post = (
    data as PostVersionWithProfile & { post?: { profile_id: string } }
  ).post as unknown as { profile_id: string }
  if (!post || post.profile_id !== profileData.id) {
    throw new Error('このバージョンにアクセス権がありません')
  }

  return data
}

/**
 * Compare two versions and return both for client-side diff
 */
export async function compareVersions(
  versionId1: string,
  versionId2: string,
  postId: string
) {
  'use cache: private'
  cacheTag('posts')

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('認証されていません')
  }

  const supabase = await createClient()

  // Get the authenticated user's profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`プロフィールの取得に失敗しました: ${profileError.message}`)
  }

  if (!profileData) {
    throw new Error('プロフィールが見つかりません')
  }

  // Verify post ownership
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, profile_id')
    .eq('id', postId)
    .eq('profile_id', profileData.id)
    .maybeSingle()

  if (postError) {
    throw new Error(`投稿の確認に失敗しました: ${postError.message}`)
  }

  if (!post) {
    throw new Error('投稿にアクセス権がありません')
  }

  const [version1Result, version2Result] = await Promise.all([
    supabase
      .from('post_versions')
      .select('*')
      .eq('id', versionId1)
      .eq('post_id', postId)
      .maybeSingle(),
    supabase
      .from('post_versions')
      .select('*')
      .eq('id', versionId2)
      .eq('post_id', postId)
      .maybeSingle()
  ])

  if (version1Result.error) {
    throw new Error(
      `バージョン1の取得に失敗しました: ${version1Result.error.message}`
    )
  }

  if (version2Result.error) {
    throw new Error(
      `バージョン2の取得に失敗しました: ${version2Result.error.message}`
    )
  }

  return {
    version1: version1Result.data,
    version2: version2Result.data
  }
}

/**
 * Rollback to a specific version by creating a new version with that content
 */
export async function rollbackToVersion(postId: string, versionId: string) {
  const supabase = await createClient()

  // Get the version to rollback to
  const { data: targetVersion, error: versionError } = await supabase
    .from('post_versions')
    .select('content, title, excerpt, tags, version_number')
    .eq('id', versionId)
    .eq('post_id', postId)
    .maybeSingle()

  if (versionError) {
    throw new Error(
      `ロールバック対象のバージョンの取得に失敗しました: ${versionError.message}`
    )
  }

  if (!targetVersion) {
    throw new Error('指定されたバージョンが見つかりません')
  }

  const versionNumber = targetVersion.version_number ?? 'unknown'

  // Use update_post to create a new version with the old content
  const { data, error } = await supabase.rpc('update_post', {
    p_change_summary: `バージョン${versionNumber}にロールバック`,
    p_content: targetVersion.content,
    p_excerpt: targetVersion.excerpt ?? undefined,
    p_post_id: postId,
    p_published_at: undefined,
    p_slug: undefined,
    p_status: undefined,
    p_tags: targetVersion.tags ?? undefined,
    p_title: targetVersion.title ?? undefined
  })

  if (error) {
    throw new Error(`ロールバックに失敗しました: ${error.message}`)
  }

  return data
}
