'use server'

import { getCurrentUser } from './auth'
import { createClient } from './supabase/server'

export type AvatarUploadResult = {
  error?: string
  url?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Map MIME types to file extensions
const MIME_TO_EXT: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}

export async function uploadAvatar(
  formData: FormData
): Promise<AvatarUploadResult> {
  try {
    const file = formData.get('avatar') as File | null

    if (!file || !(file instanceof File)) {
      return {
        error: 'ファイルが選択されていません。'
      }
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        error:
          'サポートされていない画像形式です。JPEG、PNG、GIF、WebPのみアップロード可能です。'
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        error:
          'ファイルサイズが大きすぎます。5MB以下の画像をアップロードしてください。'
      }
    }

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return {
        error: 'ユーザー情報の取得に失敗しました。ログインしてください。'
      }
    }

    const supabase = await createClient()

    // Get user's profile to check for existing avatar
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return {
        error: 'プロフィールが見つかりません。'
      }
    }

    // Delete old avatar if it exists
    if (profile.avatar_url) {
      try {
        // Extract the file path from the URL
        const url = new URL(profile.avatar_url)
        const pathMatch = url.pathname.match(/\/avatars\/(.+)/)
        if (pathMatch) {
          const oldFilePath = pathMatch[1]
          await supabase.storage.from('avatars').remove([oldFilePath])
        }
      } catch (error) {
        console.error('Failed to delete old avatar:', error)
        // Continue even if deletion fails
      }
    }

    // Derive extension from MIME type for consistency
    const fileExt = MIME_TO_EXT[file.type]
    if (!fileExt) {
      return {
        error: '不明な画像形式です。'
      }
    }

    // Generate unique filename with user ID prefix
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return {
        error: `アップロードに失敗しました: ${uploadError.message}`
      }
    }

    // Get public URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Try to delete the uploaded file
      await supabase.storage.from('avatars').remove([filePath])
      return {
        error: 'プロフィールの更新に失敗しました。'
      }
    }

    return { url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      error: 'アップロード中にエラーが発生しました。'
    }
  }
}

export async function deleteAvatar(): Promise<{ error?: string }> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return {
        error: 'ユーザー情報の取得に失敗しました。ログインしてください。'
      }
    }

    const supabase = await createClient()

    // Get user's profile to get avatar URL
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile || !profile.avatar_url) {
      return {
        error: 'アバターが設定されていません。'
      }
    }

    // Delete the file from storage
    try {
      const url = new URL(profile.avatar_url)
      const pathMatch = url.pathname.match(/\/avatars\/(.+)/)
      if (pathMatch) {
        const filePath = pathMatch[1]
        await supabase.storage.from('avatars').remove([filePath])
      }
    } catch (error) {
      console.error('Failed to delete avatar file:', error)
      // Continue to update profile even if file deletion fails
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return {
        error: 'プロフィールの更新に失敗しました。'
      }
    }

    return {}
  } catch (error) {
    console.error('Delete error:', error)
    return {
      error: '削除中にエラーが発生しました。'
    }
  }
}
