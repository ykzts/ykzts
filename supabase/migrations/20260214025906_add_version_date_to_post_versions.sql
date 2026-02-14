-- Migration: Add version_date column to post_versions table
-- Phase 4.1: Support version migration from Git history
-- This column records the actual content date (from frontmatter date/last_update)
-- while created_at continues to record the DB operation timestamp

-- 1. Add version_date column to post_versions table
ALTER TABLE post_versions
  ADD COLUMN version_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- 2. Populate existing records with created_at values
-- This ensures existing data remains consistent
UPDATE post_versions
SET version_date = created_at
WHERE version_date IS NULL;

-- 3. Update create_post function to include version_date parameter
CREATE OR REPLACE FUNCTION create_post(
  p_title TEXT,
  p_slug TEXT,
  p_excerpt TEXT,
  p_content JSONB,
  p_tags TEXT[] DEFAULT NULL,
  p_status TEXT DEFAULT 'draft',
  p_published_at TIMESTAMPTZ DEFAULT NULL,
  p_version_date TIMESTAMPTZ DEFAULT NULL
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
  v_version_date TIMESTAMPTZ;
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

  -- Set version_date to now() if not provided
  v_version_date := COALESCE(p_version_date, now());

  -- Insert the post
  INSERT INTO posts (title, slug, excerpt, status, published_at, tags, profile_id)
  VALUES (p_title, p_slug, p_excerpt, p_status, p_published_at, p_tags, v_profile_id)
  RETURNING id INTO v_post_id;

  -- Create the initial version with version_date
  INSERT INTO post_versions (post_id, version_number, content, title, excerpt, tags, created_by, change_summary, version_date)
  VALUES (v_post_id, 1, p_content, p_title, p_excerpt, p_tags, v_profile_id, 'Initial version', v_version_date)
  RETURNING id INTO v_version_id;

  -- Update the post to reference the current version
  UPDATE posts
  SET current_version_id = v_version_id
  WHERE id = v_post_id;

  RETURN v_post_id;
END;
$$;

-- 4. Update update_post function to include version_date parameter
CREATE OR REPLACE FUNCTION update_post(
  p_post_id UUID,
  p_title TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_excerpt TEXT DEFAULT NULL,
  p_content JSONB DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_published_at TIMESTAMPTZ DEFAULT NULL,
  p_change_summary TEXT DEFAULT 'Updated',
  p_version_date TIMESTAMPTZ DEFAULT NULL
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
  v_version_date TIMESTAMPTZ;
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

    -- Set version_date to now() if not provided
    v_version_date := COALESCE(p_version_date, now());

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

      -- Insert the new version with version_date
      INSERT INTO post_versions (
        post_id,
        version_number,
        content,
        title,
        excerpt,
        tags,
        created_by,
        change_summary,
        version_date
      )
      VALUES (
        p_post_id,
        v_max_version,
        v_current_content,
        COALESCE(p_title, v_current_title),
        COALESCE(p_excerpt, v_current_excerpt),
        COALESCE(p_tags, v_current_tags),
        v_profile_id,
        p_change_summary,
        v_version_date
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

-- Grant execute permissions remain the same (already granted in previous migration)
-- GRANT EXECUTE ON FUNCTION create_post TO authenticated;
-- GRANT EXECUTE ON FUNCTION update_post TO authenticated;
