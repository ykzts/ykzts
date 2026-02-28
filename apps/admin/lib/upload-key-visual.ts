'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import { invalidateCaches } from './revalidate'
import { createClient } from './supabase/server'

export type KeyVisualUploadResult = {
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

/**
 * Extract storage path from a key visual URL in the images bucket
 * @param url - Full public URL to the image in Supabase Storage
 * @returns The storage path (e.g., "user_id/key-visuals/filename.ext") or null if invalid
 */
function extractStoragePath(url: string): string | null {
  try {
    const parsed = new URL(url)
    const pathMatch = parsed.pathname.match(/\/images\/(.+)/)
    return pathMatch ? pathMatch[1] : null
  } catch {
    return null
  }
}

export async function uploadKeyVisual(
  formData: FormData
): Promise<KeyVisualUploadResult> {
  try {
    const file = formData.get('key_visual') as File | null

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

    // Get current profile's key_visual_id for cleanup
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, key_visual_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return {
        error: 'プロフィールが見つかりません。'
      }
    }

    // Delete old key visual file from storage if it exists
    if (profile.key_visual_id) {
      const { data: existingKeyVisual } = await supabase
        .from('key_visuals')
        .select('url')
        .eq('id', profile.key_visual_id)
        .maybeSingle()

      if (existingKeyVisual?.url) {
        try {
          const oldPath = extractStoragePath(existingKeyVisual.url)
          if (oldPath) {
            await supabase.storage.from('images').remove([oldPath])
          }
        } catch (error) {
          console.error('Failed to delete old key visual file:', error)
          // Continue even if deletion fails
        }
      }
    }

    // Derive extension from MIME type for consistency
    const fileExt = MIME_TO_EXT[file.type]
    if (!fileExt) {
      return {
        error: '不明な画像形式です。'
      }
    }

    // Generate unique filename with user ID and key-visuals prefix
    const fileName = `${randomUUID()}.${fileExt}`
    const filePath = `${user.id}/key-visuals/${fileName}`

    // Upload to Supabase Storage (images bucket)
    const { error: uploadError } = await supabase.storage
      .from('images')
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
    } = supabase.storage.from('images').getPublicUrl(filePath)

    return { url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      error: 'アップロード中にエラーが発生しました。'
    }
  }
}

export async function deleteKeyVisual(): Promise<{ error?: string }> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return {
        error: 'ユーザー情報の取得に失敗しました。ログインしてください。'
      }
    }

    const supabase = await createClient()

    // Get current profile's key_visual_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, key_visual_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile?.key_visual_id) {
      return {
        error: 'キービジュアルが設定されていません。'
      }
    }

    // Get the key visual URL for storage cleanup
    const { data: keyVisual } = await supabase
      .from('key_visuals')
      .select('url')
      .eq('id', profile.key_visual_id)
      .maybeSingle()

    // Delete file from storage
    if (keyVisual?.url) {
      try {
        const filePath = extractStoragePath(keyVisual.url)
        if (filePath) {
          await supabase.storage.from('images').remove([filePath])
        }
      } catch (error) {
        console.error('Failed to delete key visual file:', error)
        // Continue to update profile even if file deletion fails
      }
    }

    // Clear profiles.key_visual_id
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ key_visual_id: null })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return {
        error: 'プロフィールの更新に失敗しました。'
      }
    }

    // Delete key_visuals record
    const { error: deleteError } = await supabase
      .from('key_visuals')
      .delete()
      .eq('id', profile.key_visual_id)

    if (deleteError) {
      console.error('Failed to delete key visual record:', deleteError)
      // Continue even if record deletion fails
    }

    // Invalidate cache and revalidate paths
    await invalidateCaches('profile')
    revalidatePath('/profile')
    revalidatePath('/profile/edit')

    return {}
  } catch (error) {
    console.error('Delete error:', error)
    return {
      error: '削除中にエラーが発生しました。'
    }
  }
}
