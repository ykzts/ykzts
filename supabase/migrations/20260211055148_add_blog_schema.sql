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

-- Update existing rows to have 'draft' status if NULL before adding CHECK constraint
UPDATE posts SET status = 'draft' WHERE status IS NULL;

-- Add CHECK constraint for status column (allows NULL for new rows but ensures valid values when set)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_status_check'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_status_check
      CHECK (status IS NULL OR status IN ('draft', 'scheduled', 'published'));
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
-- Note: posts_slug_idx is not needed as UNIQUE constraint already creates an index
-- Note: post_versions indexes are not needed as UNIQUE(post_id, version_number) already creates them
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at DESC);

-- 4. Enable Row Level Security for post_versions table
ALTER TABLE post_versions ENABLE ROW LEVEL SECURITY;

-- 5. Update RLS policies for posts table
-- Drop existing policies from previous migrations
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON posts;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON posts;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON posts;

-- Create new policies for posts
-- Public can read published posts that are already published
CREATE POLICY "Enable read access for published posts" ON posts
  FOR SELECT
  USING (status = 'published' AND published_at <= now());

-- Authenticated users can read all posts (drafts, scheduled, published)
CREATE POLICY "Enable read access for authenticated users" ON posts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Block direct INSERT/UPDATE/DELETE - must use functions
CREATE POLICY "Block direct insert" ON posts
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block direct update" ON posts
  FOR UPDATE
  USING (false);

CREATE POLICY "Block direct delete" ON posts
  FOR DELETE
  USING (false);

-- 6. Create RLS policies for post_versions table
-- Public can read versions for published posts
CREATE POLICY "Enable read access for published post versions" ON post_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_versions.post_id
        AND posts.status = 'published'
        AND posts.published_at <= now()
    )
  );

-- Authenticated users can read all post versions
CREATE POLICY "Enable read access for authenticated users" ON post_versions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Block direct INSERT/UPDATE/DELETE - must use functions
CREATE POLICY "Block direct insert" ON post_versions
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block direct update" ON post_versions
  FOR UPDATE
  USING (false);

CREATE POLICY "Block direct delete" ON post_versions
  FOR DELETE
  USING (false);

-- 7. Create functions for post management

-- Function to create a new post with initial version
CREATE OR REPLACE FUNCTION create_post(
  p_title TEXT,
  p_slug TEXT,
  p_excerpt TEXT,
  p_content JSONB,
  p_tags TEXT[] DEFAULT NULL,
  p_status TEXT DEFAULT 'draft',
  p_published_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
  v_version_id UUID;
  v_profile_id UUID;
BEGIN
  -- Get the profile_id for the current user
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE user_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Validate required fields
  IF p_slug IS NULL OR p_slug = '' THEN
    RAISE EXCEPTION 'Slug is required and cannot be empty';
  END IF;

  -- Validate status
  IF p_status NOT IN ('draft', 'scheduled', 'published') THEN
    RAISE EXCEPTION 'Invalid status. Must be draft, scheduled, or published';
  END IF;

  -- Auto-set published_at for published posts
  IF p_status = 'published' AND p_published_at IS NULL THEN
    p_published_at := now();
  END IF;

  -- Insert the post
  INSERT INTO posts (title, slug, excerpt, status, published_at, tags, profile_id)
  VALUES (p_title, p_slug, p_excerpt, p_status, p_published_at, p_tags, v_profile_id)
  RETURNING id INTO v_post_id;

  -- Create the initial version
  INSERT INTO post_versions (post_id, version_number, content, title, excerpt, tags, created_by, change_summary)
  VALUES (v_post_id, 1, p_content, p_title, p_excerpt, p_tags, v_profile_id, 'Initial version')
  RETURNING id INTO v_version_id;

  -- Update the post to reference the current version
  UPDATE posts
  SET current_version_id = v_version_id
  WHERE id = v_post_id;

  RETURN v_post_id;
END;
$$;

-- Function to update a post and create a new version
CREATE OR REPLACE FUNCTION update_post(
  p_post_id UUID,
  p_title TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_excerpt TEXT DEFAULT NULL,
  p_content JSONB DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_published_at TIMESTAMPTZ DEFAULT NULL,
  p_change_summary TEXT DEFAULT 'Updated'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version_id UUID;
  v_profile_id UUID;
  v_owner_profile_id UUID;
  v_max_version INTEGER;
  v_current_title TEXT;
  v_current_excerpt TEXT;
  v_current_tags TEXT[];
BEGIN
  -- Get the profile_id for the current user
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE user_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Check ownership
  SELECT profile_id INTO v_owner_profile_id
  FROM posts
  WHERE id = p_post_id;

  IF v_owner_profile_id IS NULL THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  IF v_owner_profile_id != v_profile_id THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Validate status if provided
  IF p_status IS NOT NULL AND p_status NOT IN ('draft', 'scheduled', 'published') THEN
    RAISE EXCEPTION 'Invalid status. Must be draft, scheduled, or published';
  END IF;

  -- Get current values for fields not being updated
  SELECT title, excerpt, tags, published_at INTO v_current_title, v_current_excerpt, v_current_tags, p_published_at
  FROM posts
  WHERE id = p_post_id;

  -- Auto-set published_at when publishing for the first time
  IF p_status = 'published' THEN
    -- If no published_at provided and post doesn't have one, set to now()
    IF p_published_at IS NULL THEN
      SELECT published_at INTO p_published_at FROM posts WHERE id = p_post_id;
      IF p_published_at IS NULL THEN
        p_published_at := now();
      END IF;
    END IF;
  END IF;

  -- Update the post fields that are provided
  UPDATE posts
  SET
    title = COALESCE(p_title, title),
    slug = COALESCE(p_slug, slug),
    excerpt = COALESCE(p_excerpt, excerpt),
    tags = COALESCE(p_tags, tags),
    status = COALESCE(p_status, status),
    published_at = CASE
      WHEN p_status = 'published' THEN p_published_at
      ELSE COALESCE(p_published_at, published_at)
    END
  WHERE id = p_post_id;

  -- Create a new version if content is provided OR if any metadata changed
  IF p_content IS NOT NULL OR
     p_title IS NOT NULL OR
     p_excerpt IS NOT NULL OR
     p_tags IS NOT NULL THEN
    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_max_version
    FROM post_versions
    WHERE post_id = p_post_id;

    -- Get current content if not provided
    DECLARE
      v_current_content JSONB;
    BEGIN
      IF p_content IS NULL THEN
        SELECT content INTO v_current_content
        FROM post_versions
        WHERE post_id = p_post_id AND id = (
          SELECT current_version_id FROM posts WHERE id = p_post_id
        );
      ELSE
        v_current_content := p_content;
      END IF;

      -- Insert the new version
      INSERT INTO post_versions (
        post_id,
        version_number,
        content,
        title,
        excerpt,
        tags,
        created_by,
        change_summary
      )
      VALUES (
        p_post_id,
        v_max_version,
        v_current_content,
        COALESCE(p_title, v_current_title),
        COALESCE(p_excerpt, v_current_excerpt),
        COALESCE(p_tags, v_current_tags),
        v_profile_id,
        p_change_summary
      )
      RETURNING id INTO v_version_id;

      -- Update the post to reference the new current version
      UPDATE posts
      SET current_version_id = v_version_id
      WHERE id = p_post_id;
    END;
  END IF;

  RETURN p_post_id;
END;
$$;

-- Function to delete a post (and all its versions due to CASCADE)
CREATE OR REPLACE FUNCTION delete_post(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_owner_profile_id UUID;
BEGIN
  -- Get the profile_id for the current user
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE user_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Check ownership
  SELECT profile_id INTO v_owner_profile_id
  FROM posts
  WHERE id = p_post_id;

  IF v_owner_profile_id IS NULL THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  IF v_owner_profile_id != v_profile_id THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Delete the post (versions will be deleted automatically due to CASCADE)
  DELETE FROM posts WHERE id = p_post_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_post TO authenticated;
GRANT EXECUTE ON FUNCTION update_post TO authenticated;
GRANT EXECUTE ON FUNCTION delete_post TO authenticated;

-- Note: post_versions table doesn't have updated_at column as versions are immutable
-- Note: The trigger function update_updated_at_column() already exists from the initial migration for posts table
-- Note: current_version_id is initially NULL and can be updated later when versions are created
-- Note: All write operations must go through the functions above to ensure business logic is enforced
