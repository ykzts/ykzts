'use client'

import { createClient } from '@/lib/supabase/client'

export type ImageUploadOptions = {
  file: File
  onProgress?: (progress: number) => void
}

export type ImageUploadResult = {
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

export async function uploadImage({
  file,
  onProgress
}: ImageUploadOptions): Promise<ImageUploadResult> {
  try {
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

    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        error: 'ユーザー情報の取得に失敗しました。ログインしてください。'
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

    // Report initial progress
    if (onProgress) {
      onProgress(0)
    }

    // Upload to Supabase Storage
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

    // Report completion
    if (onProgress) {
      onProgress(100)
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
