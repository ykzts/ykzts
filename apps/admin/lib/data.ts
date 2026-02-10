import { cacheTag } from 'next/cache'
import { getCurrentUser } from './auth'
import { createClient } from './supabase/server'

export async function getProfile() {
  'use cache: private'
  cacheTag('profile')

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('ログインが必要です。')
  }

  const supabase = await createClient()

  // Get current authenticated user
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('認証されていません')
  }

  // Filter by user_id to get the authenticated user's profile
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, tagline, email, about, created_at, updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`プロフィールの取得に失敗しました: ${error.message}`)
  }

  return data
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
