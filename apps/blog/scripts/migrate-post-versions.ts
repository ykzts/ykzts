#!/usr/bin/env tsx
/**
 * Phase 4.2: Git履歴ベースの移行スクリプト
 *
 * このスクリプトは以下を実行します：
 * 1. apps/blog-legacy/blog内の全MDXファイルを検索
 * 2. 各ファイルのGit履歴を分析して複数バージョンを生成
 * 3. post_versionsテーブルに挿入
 *
 * Usage:
 *   pnpm tsx apps/blog/scripts/migrate-post-versions.ts [--dry-run]
 *
 * Options:
 *   --dry-run  データベースに書き込まずに実行（デバッグ用）
 */

import { readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@ykzts/supabase'
import { generateVersionsFromHistory } from './lib/analyze-git-history.ts'

// Repository root - use environment variable or detect from script location
const REPO_ROOT = process.env.REPO_ROOT || process.cwd()
const BLOG_LEGACY_DIR = join(REPO_ROOT, 'apps/blog-legacy/blog')

// Supabase client (initialized only if not in dry-run mode)
// Note: Prefixed with underscore as it's unused in current implementation.
// Will be used when database insertion logic is implemented in Phase 4.3.
let _supabase: ReturnType<typeof createClient<Database>> | null = null

function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase credentials not found')
    console.error(
      'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY'
    )
    process.exit(1)
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
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
 * Extract slug from file path
 * Example: apps/blog-legacy/blog/2022/11/03/bought-ps5/index.mdx -> 2022-11-03-bought-ps5
 */
function extractSlug(filePath: string): string {
  const relativePath = relative(BLOG_LEGACY_DIR, filePath)
  const parts = relativePath.split('/')

  // Expected format: YYYY/MM/DD/slug/index.mdx
  if (parts.length >= 5 && parts[4] === 'index.mdx') {
    const [year, month, day, slug] = parts
    return `${year}-${month}-${day}-${slug}`
  }

  // Fallback
  return relativePath.replace(/\//g, '-').replace(/\.mdx$/, '')
}

/**
 * Convert MDX content to Portable Text format
 * TODO: Implement proper MDX to Portable Text conversion in Phase 4.3
 *
 * Note: This function is prefixed with underscore as it is a placeholder
 * that will be replaced with actual implementation in a future phase.
 * The underscore indicates it's intentionally unused in the current version.
 */
function _convertToPortableTextPlaceholder(content: string): unknown {
  // For now, store as a simple text block
  return [
    {
      _key: 'content',
      _type: 'block',
      children: [
        {
          _key: 'text',
          _type: 'span',
          marks: [],
          text: content
        }
      ],
      style: 'normal'
    }
  ]
}

/**
 * Main migration function
 */
async function migrate(dryRun = false) {
  // Initialize Supabase client if not in dry-run mode
  if (!dryRun) {
    _supabase = initSupabase()
  }

  console.log('🔍 Scanning for MDX files...')
  const mdxFiles = await findMDXFiles(BLOG_LEGACY_DIR)
  console.log(`Found ${mdxFiles.length} MDX files\n`)

  let totalVersions = 0
  let filesWithMultipleVersions = 0
  let filesProcessed = 0
  let errors = 0

  for (const filePath of mdxFiles) {
    const relativePath = relative(REPO_ROOT, filePath)
    const slug = extractSlug(filePath)

    try {
      console.log(`\n📄 Processing: ${relativePath}`)
      console.log(`   Slug: ${slug}`)

      // Generate versions from Git history
      const versions = await generateVersionsFromHistory(relativePath)
      console.log(`   Found ${versions.length} version(s)`)

      if (versions.length === 0) {
        console.log(
          `   ⚠️  No versions found (file might not be in Git history)`
        )
        continue
      }

      if (versions.length > 1) {
        filesWithMultipleVersions++
      }

      totalVersions += versions.length

      // Display version info
      for (const version of versions) {
        console.log(`   Version ${version.versionNumber}:`)
        console.log(`     Date: ${version.versionDate.toISOString()}`)
        console.log(`     Title: ${version.frontmatter.title}`)
        console.log(
          `     Tags: ${version.frontmatter.tags?.join(', ') || 'none'}`
        )

        if (dryRun) {
          console.log(`     [DRY RUN] Would insert into database`)
        } else {
          // TODO: Insert into database
          // This will be implemented after confirming the structure is correct
          console.log(`     [TODO] Database insertion not yet implemented`)
        }
      }

      filesProcessed++
    } catch (error) {
      console.error(`   ❌ Error processing ${relativePath}:`, error)
      errors++
    }
  }

  // Summary
  console.log(`\n\n${'='.repeat(60)}`)
  console.log('📊 Migration Summary')
  console.log('='.repeat(60))
  console.log(`Total files found:              ${mdxFiles.length}`)
  console.log(`Files processed:                ${filesProcessed}`)
  console.log(`Files with multiple versions:   ${filesWithMultipleVersions}`)
  console.log(`Total versions generated:       ${totalVersions}`)
  console.log(`Errors:                         ${errors}`)

  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No data was written to database')
  }
}

// Run migration
const dryRun = process.argv.includes('--dry-run')
migrate(dryRun).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
