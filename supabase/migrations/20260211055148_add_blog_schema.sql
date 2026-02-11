-- Migration: Add blog schema with posts table expansion and post_versions table
-- Phase 1: Database schema expansion and version management for blog renewal

-- 1. Extend posts table with new columns
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS redirect_from TEXT[],
  ADD COLUMN IF NOT EXISTS current_version_id UUID;

-- Add UNIQUE constraint on slug (only after column exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_slug_key'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Add CHECK constraint for status column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_status_check'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_status_check 
      CHECK (status IN ('draft', 'scheduled', 'published'));
  END IF;
END $$;

-- 2. Create post_versions table
CREATE TABLE IF NOT EXISTS post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  title TEXT,
  excerpt TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  change_summary TEXT,
  UNIQUE(post_id, version_number)
);

-- Add foreign key from posts.current_version_id to post_versions.id
-- This creates a circular reference, but it's intentional for version tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_current_version_id_fkey'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_current_version_id_fkey 
      FOREIGN KEY (current_version_id) REFERENCES post_versions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS post_versions_post_id_idx ON post_versions(post_id);
CREATE INDEX IF NOT EXISTS post_versions_version_number_idx ON post_versions(post_id, version_number);

-- 4. Enable Row Level Security for post_versions table
ALTER TABLE post_versions ENABLE ROW LEVEL SECURITY;

-- 5. Update RLS policies for posts table
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;

-- Create new policies for posts
-- Public can read published posts that are already published
CREATE POLICY "Enable read access for published posts" ON posts
  FOR SELECT
  USING (status = 'published' AND published_at <= now());

-- Authenticated users can read all posts (drafts, scheduled, published)
CREATE POLICY "Enable read access for authenticated users" ON posts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert posts
CREATE POLICY "Enable insert for authenticated users" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update posts
CREATE POLICY "Enable update for authenticated users" ON posts
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can delete posts
CREATE POLICY "Enable delete for authenticated users" ON posts
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- 6. Create RLS policies for post_versions table
-- Authenticated users can read all post versions
CREATE POLICY "Enable read access for authenticated users" ON post_versions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert post versions
CREATE POLICY "Enable insert for authenticated users" ON post_versions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update post versions
CREATE POLICY "Enable update for authenticated users" ON post_versions
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can delete post versions
CREATE POLICY "Enable delete for authenticated users" ON post_versions
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Note: post_versions table doesn't have updated_at column as versions are immutable
-- Note: The trigger function update_updated_at_column() already exists from the initial migration for posts table
-- Note: current_version_id is initially NULL and can be updated later when versions are created
