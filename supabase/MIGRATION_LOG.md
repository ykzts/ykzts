# Migration Execution Log

## Phase 1: Database Schema Expansion and Version Management

**Date:** 2026-02-11  
**Migration File:** `20260211055148_add_blog_schema.sql`

### Changes Made

#### 1. Extended `posts` Table
Added the following columns:
- `slug` (TEXT) - URL identifier, UNIQUE constraint
- `excerpt` (TEXT) - Post summary/description
- `status` (TEXT) - Post status with CHECK constraint ('draft', 'scheduled', 'published')
- `published_at` (TIMESTAMPTZ) - Publication/scheduled date
- `tags` (TEXT[]) - Array of tags
- `redirect_from` (TEXT[]) - Legacy Tumblr redirect paths
- `current_version_id` (UUID) - Foreign key to post_versions.id

#### 2. Created `post_versions` Table
New table with the following structure:
- `id` (UUID) - Primary key
- `post_id` (UUID) - Foreign key to posts.id (CASCADE on delete)
- `version_number` (INTEGER) - Version number
- `content` (JSONB) - Portable Text content
- `title` (TEXT) - Title snapshot
- `excerpt` (TEXT) - Excerpt snapshot
- `tags` (TEXT[]) - Tags snapshot
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `created_by` (UUID) - Foreign key to profiles.id (SET NULL on delete)
- `change_summary` (TEXT) - Description of changes
- UNIQUE constraint on (post_id, version_number)

#### 3. Created Indexes
- `posts_slug_idx` on posts(slug)
- `posts_status_idx` on posts(status)
- `posts_published_at_idx` on posts(published_at DESC)
- `post_versions_post_id_idx` on post_versions(post_id)
- `post_versions_version_number_idx` on post_versions(post_id, version_number)

#### 4. Updated RLS Policies

**Posts table:**
- Replaced single public read policy with multiple policies:
  - Public can read published posts (status='published' AND published_at<=now())
  - Authenticated users can read all posts
  - Authenticated users can insert, update, delete posts

**Post_versions table (new):**
- Authenticated users can read all versions
- Authenticated users can insert, update, delete versions

### Execution Instructions

#### For Local Development:

```bash
# 1. Start Supabase local instance
npx supabase start

# 2. Apply migrations (this will apply all migrations including the new one)
npx supabase db reset

# 3. Verify migration was applied
npx supabase db diff

# 4. Generate TypeScript types
cd packages/supabase
pnpm typegen
```

#### For Production Deployment:

```bash
# Option 1: Push to remote database (recommended)
npx supabase db push

# Option 2: Apply specific migration
npx supabase migration up --include-all

# Verify migration status
npx supabase migration list
```

### Migration Validation Checklist

- [x] Migration file created with proper timestamp
- [x] All column additions use `IF NOT EXISTS`
- [x] Constraints are added safely with conditional blocks
- [x] Foreign key relationships are properly defined
- [x] Indexes created for query performance
- [x] RLS policies properly configured
- [x] TypeScript types updated to match schema
- [x] Migration is idempotent (can be run multiple times safely)
- [ ] Migration tested on local Supabase instance
- [ ] Migration applied to production database
- [ ] Post-migration verification completed

### Post-Migration Verification

After running the migration, verify with these SQL queries:

```sql
-- Check posts table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- Check post_versions table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'post_versions'
ORDER BY ordinal_position;

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('posts', 'post_versions');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('posts', 'post_versions');

-- Verify constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid IN ('posts'::regclass, 'post_versions'::regclass);
```

### Known Considerations

1. **Existing Data:** The `slug` column is initially nullable. Before enforcing NOT NULL, ensure all existing posts have slugs assigned.

2. **Circular Reference:** The `posts.current_version_id` references `post_versions.id`, and `post_versions.post_id` references `posts.id`. This is intentional but requires careful handling when creating new posts with versions.

3. **Version Numbers:** Version numbers start from 1 and should be sequential. Application logic should handle version number assignment.

4. **Status Default:** New posts default to 'draft' status. Publishing logic should update both `status` and `published_at` fields.

5. **RLS Policy Order:** Multiple RLS policies on posts table use OR logic. Authenticated users can see all posts, while public users only see published posts.

### Rollback Procedure (If Needed)

If you need to rollback this migration:

```sql
-- 1. Drop foreign key constraints
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_current_version_id_fkey;

-- 2. Drop post_versions table
DROP TABLE IF EXISTS post_versions CASCADE;

-- 3. Remove added columns from posts
ALTER TABLE posts
  DROP COLUMN IF EXISTS current_version_id,
  DROP COLUMN IF EXISTS redirect_from,
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS published_at,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS excerpt,
  DROP COLUMN IF EXISTS slug;

-- 4. Restore original RLS policy
DROP POLICY IF EXISTS "Enable read access for published posts" ON posts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON posts;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON posts;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON posts;

CREATE POLICY "Enable read access for all users" ON posts
  FOR SELECT
  USING (true);
```

### Next Steps

1. Apply the migration to production database
2. Update admin application to use new fields
3. Implement version creation logic
4. Add UI for version management
5. Implement blog post publishing workflow
6. Add slug generation logic
7. Test Tumblr redirect functionality

### Support

If you encounter any issues with this migration:
1. Check the error message in Supabase logs
2. Verify all dependencies (profiles table) exist
3. Ensure Supabase CLI is up to date
4. Consult the migration README.md file
5. Review the SQL migration file for any environment-specific issues
