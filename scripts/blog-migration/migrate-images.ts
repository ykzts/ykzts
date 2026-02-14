#!/usr/bin/env node
/**
 * Phase 4.3: Image Migration Script
 *
 * このスクリプトは以下を実行します：
 * 1. apps/blog-legacy/blog内の全MDXファイルを検索
 * 2. 各ファイル内の画像参照を検出
 * 3. 画像をSupabase Storageにアップロード
 * 4. アップロード結果を記録（将来的なMDX変換用）
 *
 * Usage:
 *   node scripts/blog-migration/migrate-images.ts [--dry-run]
 *
 * Options:
 *   --dry-run  画像をアップロードせずに実行（デバッグ用）
 */

import { createClient } from '@supabase/supabase-js'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import type { Database } from '@ykzts/supabase'
import {
  detectImagesInFile,
  getMimeType,
  type ImageReference
} from './lib/detect-images.ts'

const execFileAsync = promisify(execFile)

// Repository root - auto-detect using git or environment variable
async function getRepoRoot(): Promise<string> {
  if (process.env.REPO_ROOT) {
    return process.env.REPO_ROOT
  }

  try {
    const { stdout } = await execFileAsync('git', [
      'rev-parse',
      '--show-toplevel'
    ])
    return stdout.trim()
  } catch {
    // Fallback to script location
    return join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  }
}

const REPO_ROOT = await getRepoRoot()
const BLOG_LEGACY_DIR = join(REPO_ROOT, 'apps/blog-legacy/blog')

// Supabase client (initialized only if not in dry-run mode)
let supabase: ReturnType<typeof createClient<Database>> | null = null

function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase credentials not found')
    console.error(
      'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY'
    )
    console.error(
      'Note: SUPABASE_SERVICE_KEY is required for migration (not NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    )
    process.exit(1)
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Recursively find all MDX files in a directory
 */
async function findMDXFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      const subFiles = await findMDXFiles(fullPath)
      files.push(...subFiles)
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Generate a hash for file content
 */
function generateFileHash(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex')
}

/**
 * Upload an image to Supabase Storage
 * @returns The public URL of the uploaded image, or null on failure
 */
async function uploadImage(
  imageRef: ImageReference,
  userId: string,
  dryRun = false
): Promise<string | null> {
  const fileContent = await readFile(imageRef.absolutePath)
  const fileHash = generateFileHash(fileContent)
  const ext = extname(imageRef.absolutePath).substring(1) // Remove leading dot
  const mimeType = getMimeType(imageRef.absolutePath)

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
    throw new Error('Supabase client not initialized')
  }

  try {
    // Check if file already exists
    const { data: existingFile } = await supabase.storage
      .from('images')
      .list(userId, {
        limit: 1,
        search: fileName
      })

    if (existingFile && existingFile.length > 0) {
      console.log(`     ℹ️  Already exists: ${fileName}`)
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

interface ImageMigrationResult {
  mdxFile: string
  originalPath: string
  newUrl: string | null
  altText: string
  success: boolean
}

/**
 * Main migration function
 */
async function migrate(dryRun = false) {
  // Initialize Supabase client if not in dry-run mode
  if (!dryRun) {
    supabase = initSupabase()

    // Get the authenticated user (service key should authenticate as admin)
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Error: Could not authenticate with Supabase')
      console.error('Make sure SUPABASE_SERVICE_KEY is correct')
      process.exit(1)
    }

    console.log(`Authenticated as user: ${user.id}`)
  }

  console.log('🔍 Scanning for MDX files...')
  const mdxFiles = await findMDXFiles(BLOG_LEGACY_DIR)
  console.log(`Found ${mdxFiles.length} MDX files\n`)

  let totalImages = 0
  let uniqueImages = 0
  let uploadedImages = 0
  let failedImages = 0
  let totalSize = 0
  const imageResults: ImageMigrationResult[] = []
  const processedHashes = new Set<string>()

  for (const filePath of mdxFiles) {
    const relativePath = relative(REPO_ROOT, filePath)

    try {
      console.log(`\n📄 Processing: ${relativePath}`)

      // Detect images in the file
      const images = await detectImagesInFile(filePath)

      if (images.length === 0) {
        console.log('   No images found')
        continue
      }

      console.log(`   Found ${images.length} image reference(s)`)
      totalImages += images.length

      for (const image of images) {
        console.log(`\n   🖼️  Image: ${image.path}`)
        console.log(`     Alt: ${image.altText || '(none)'}`)

        if (!image.exists) {
          console.log(`     ⚠️  File not found: ${image.absolutePath}`)
          failedImages++
          imageResults.push({
            altText: image.altText,
            mdxFile: relativePath,
            newUrl: null,
            originalPath: image.path,
            success: false
          })
          continue
        }

        // Check if we've already processed this image (by hash)
        const fileContent = await readFile(image.absolutePath)
        const fileHash = generateFileHash(fileContent)

        const isUnique = !processedHashes.has(fileHash)
        if (isUnique) {
          uniqueImages++
          processedHashes.add(fileHash)
        } else {
          console.log('     ℹ️  Duplicate image (already processed)')
        }

        const stats = await stat(image.absolutePath)
        totalSize += stats.size

        // Upload the image (or simulate in dry-run mode)
        let newUrl: string | null = null
        if (dryRun || !supabase) {
          // For dry-run, use a fake user ID
          newUrl = await uploadImage(image, 'dry-run-user-id', true)
        } else {
          const {
            data: { user }
          } = await supabase.auth.getUser()
          if (user) {
            newUrl = await uploadImage(image, user.id, false)
          }
        }

        if (newUrl) {
          uploadedImages++
          imageResults.push({
            altText: image.altText,
            mdxFile: relativePath,
            newUrl,
            originalPath: image.path,
            success: true
          })
        } else {
          failedImages++
          imageResults.push({
            altText: image.altText,
            mdxFile: relativePath,
            newUrl: null,
            originalPath: image.path,
            success: false
          })
        }
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${relativePath}:`, error)
    }
  }

  // Summary
  console.log(`\n\n${'='.repeat(60)}`)
  console.log('📊 Migration Summary')
  console.log('='.repeat(60))
  console.log(`Total MDX files scanned:        ${mdxFiles.length}`)
  console.log(`Total image references found:   ${totalImages}`)
  console.log(`Unique images:                  ${uniqueImages}`)
  console.log(`Successfully uploaded:          ${uploadedImages}`)
  console.log(`Failed uploads:                 ${failedImages}`)
  console.log(`Total size:                     ${(totalSize / 1024 / 1024).toFixed(2)} MB`)

  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No images were uploaded')
  }

  // Show failed images if any
  if (failedImages > 0) {
    console.log(`\n❌ Failed Images (${failedImages}):`)
    for (const result of imageResults.filter((r) => !r.success)) {
      console.log(`   ${result.mdxFile}: ${result.originalPath}`)
    }
  }
}

// Run migration
const dryRun = process.argv.includes('--dry-run')
migrate(dryRun).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
