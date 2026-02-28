import { cacheTag } from 'next/cache'
import { getCurrentUser } from './auth'
import { createClient } from './supabase/server'
import { DEFAULT_TIMEZONE } from './timezones'

export async function getProfile() {
  'use cache: private'
  cacheTag('profile')

  // Get current authenticated user (cached)
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('認証されていません')
  }

  const supabase = await createClient()

  // Filter by user_id to get the authenticated user's profile
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, name, occupation, tagline, email, fediverse_creator, about, timezone, avatar_url, created_at, updated_at, key_visuals(id, url, width, height, alt_text, artist_name, artist_url, attribution)'
    )
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`プロフィールの取得に失敗しました: ${error.message}`)
  }

  return data
}

/**
 * Get only the timezone setting from the user's profile
 * Lightweight version of getProfile() for pages that only need timezone info
 */
export async function getProfileTimezone(): Promise<string> {
  'use cache: private'
  cacheTag('profile')

  const user = await getCurrentUser()

  if (!user) {
    return DEFAULT_TIMEZONE
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) {
    return DEFAULT_TIMEZONE
  }

  return data.timezone ?? DEFAULT_TIMEZONE
}

export async function getSocialLinks() {
  'use cache: private'
  cacheTag('profile')

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('ログインが必要です。')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('social_links')
    .select('id, service, url, sort_order, profile_id!inner(user_id)')
    .eq('profile_id.user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`ソーシャルリンクの取得に失敗しました: ${error.message}`)
  }

  return data ?? []
}

export async function getTechnologies() {
  'use cache: private'
  cacheTag('profile')

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('ログインが必要です。')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('technologies')
    .select('id, name, sort_order, profile_id!inner(user_id)')
    .eq('profile_id.user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`技術タグの取得に失敗しました: ${error.message}`)
  }

  return data ?? []
}

export async function getWorks() {
  'use cache: private'
  cacheTag('works')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('works')
    .select('id, title, slug, starts_at, created_at')
    .order('starts_at', { ascending: false })

  if (error) {
    throw new Error(`作品の取得に失敗しました: ${error.message}`)
  }

  return data
}

export async function getWork(id: string) {
  'use cache: private'
  cacheTag('works')

  const supabase = await createClient()

  // Get current user's profile to ensure we only fetch their works
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id')
    .maybeSingle()

  if (!profileData) {
    return null
  }

  // Note: profile_id filtering is handled by RLS policies
  // We verify the user has a profile, and RLS ensures they can only see their own works
  const { data, error } = await supabase
    .from('works')
    .select('id, title, slug, starts_at, content, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`作品の取得に失敗しました: ${error.message}`)
  }

  return data
}

export async function getPosts() {
  'use cache: private'
  cacheTag('posts')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`投稿の取得に失敗しました: ${error.message}`)
  }

  return data
}

export async function getPost(id: string) {
  'use cache: private'
  cacheTag('posts')

  // Get current authenticated user (cached)
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

  // Restrict posts by both post ID and the authenticated user's profile_id
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, created_at, updated_at')
    .eq('id', id)
    .eq('profile_id', profileData.id)
    .maybeSingle()

  if (error) {
    throw new Error(`投稿の取得に失敗しました: ${error.message}`)
  }

  return data
}

export async function getCounts() {
  'use cache: private'
  cacheTag('counts')

  const supabase = await createClient()

  const [profilesResult, worksResult, postsResult] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('works').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true })
  ])

  if (profilesResult.error) {
    throw new Error(
      `プロフィール数の取得に失敗しました: ${profilesResult.error.message}`
    )
  }
  if (worksResult.error) {
    throw new Error(`作品数の取得に失敗しました: ${worksResult.error.message}`)
  }
  if (postsResult.error) {
    throw new Error(`投稿数の取得に失敗しました: ${postsResult.error.message}`)
  }

  return {
    posts: postsResult.count ?? 0,
    profiles: profilesResult.count ?? 0,
    works: worksResult.count ?? 0
  }
}
