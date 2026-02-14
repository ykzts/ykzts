import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@ykzts/supabase'
import {
  getExtensionFromMimeType,
  getMimeType,
  type ImageReference
} from './detect-images.ts'

/**
 * Generate a hash for file content
 */
function generateFileHash(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex')
}

/**
 * Upload an image to Supabase Storage
 * @param imageRef - Image reference with path information
 * @param userId - User ID for storage path
 * @param supabase - Supabase client instance
 * @returns The public URL of the uploaded image, or null on failure
 */
export async function uploadImageToStorage(
  imageRef: ImageReference,
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<string | null> {
  const fileContent = await readFile(imageRef.absolutePath)
  const fileHash = generateFileHash(fileContent)
  const mimeType = getMimeType(imageRef.absolutePath)
  const ext = getExtensionFromMimeType(mimeType)

  // Use hash as filename to deduplicate
  const fileName = `${fileHash}.${ext}`
  const filePath = `${userId}/${fileName}`

  try {
    // Check if file already exists
    const { data: existingFile } = await supabase.storage
      .from('images')
      .list(userId, {
        limit: 1,
        search: fileName
      })

    if (existingFile && existingFile.length > 0) {
      // File already exists, return the URL
      const {
        data: { publicUrl }
      } = supabase.storage.from('images').getPublicUrl(filePath)
      return publicUrl
    }

    // Upload the image
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, fileContent, {
        cacheControl: '31536000', // 1 year
        contentType: mimeType,
        upsert: false
      })

    if (uploadError) {
      console.error(`     ❌ Upload failed: ${uploadError.message}`)
      return null
    }

    // Get public URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('images').getPublicUrl(filePath)

    const stats = await stat(imageRef.absolutePath)
    console.log(`     ✅ Uploaded: ${fileName}`)
    console.log(`       Size: ${(stats.size / 1024).toFixed(2)} KB`)
    console.log(`       URL: ${publicUrl}`)

    return publicUrl
  } catch (error) {
    console.error(`     ❌ Error uploading image:`, error)
    return null
  }
}

/**
 * Upload an image (with dry-run support for standalone script)
 * @param imageRef - Image reference with path information
 * @param userId - User ID for storage path
 * @param dryRun - If true, simulates upload without actually uploading
 * @param supabase - Supabase client instance (optional for dry-run)
 * @returns The public URL of the uploaded image, or null on failure
 */
export async function uploadImage(
  imageRef: ImageReference,
  userId: string,
  dryRun: boolean,
  supabase?: SupabaseClient<Database>
): Promise<string | null> {
  const fileContent = await readFile(imageRef.absolutePath)
  const fileHash = generateFileHash(fileContent)
  const mimeType = getMimeType(imageRef.absolutePath)
  const ext = getExtensionFromMimeType(mimeType)

  // Use hash as filename to deduplicate
  const fileName = `${fileHash}.${ext}`
  const filePath = `${userId}/${fileName}`

  if (dryRun) {
    const stats = await stat(imageRef.absolutePath)
    console.log(`     [DRY RUN] Would upload:`)
    console.log(`       File: ${fileName}`)
    console.log(`       Size: ${(stats.size / 1024).toFixed(2)} KB`)
    console.log(`       Type: ${mimeType}`)
    console.log(`       Path: ${filePath}`)

    // Return a fake URL for dry-run mode
    return `https://example.com/storage/v1/object/public/images/${filePath}`
  }

  if (!supabase) {
    throw new Error('Supabase client is required for actual upload')
  }

  return uploadImageToStorage(imageRef, userId, supabase)
}
