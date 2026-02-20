-- Migration: Simplify post status logic
-- UI now only exposes 'draft' and 'published' statuses.
-- Backend automatically determines 'scheduled' based on published_at value.

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
  v_final_status TEXT;
  v_final_published_at TIMESTAMPTZ;
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
  IF p_status NOT IN ('draft', 'published') THEN
    RAISE EXCEPTION 'Invalid status. Must be draft or published';
  END IF;

  -- Determine final status and published_at
  IF p_status = 'draft' THEN
    v_final_status := 'draft';
    v_final_published_at := p_published_at;
  ELSE
    -- p_status = 'published': determine actual status based on published_at
    IF p_published_at IS NULL THEN
      v_final_published_at := CURRENT_TIMESTAMP;
      v_final_status := 'published';
    ELSIF p_published_at > CURRENT_TIMESTAMP THEN
      v_final_published_at := p_published_at;
      v_final_status := 'scheduled';
    ELSE
      v_final_published_at := p_published_at;
      v_final_status := 'published';
    END IF;
  END IF;

  -- Insert the post
  INSERT INTO posts (title, slug, excerpt, status, published_at, tags, profile_id)
  VALUES (p_title, p_slug, p_excerpt, v_final_status, v_final_published_at, p_tags, v_profile_id)
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
  v_current_status TEXT;
  v_effective_status TEXT;
  v_db_published_at TIMESTAMPTZ;
  v_final_published_at TIMESTAMPTZ;
  v_final_status TEXT;
  v_version_date TIMESTAMPTZ;
  v_current_content JSONB;
BEGIN
  -- Get the profile_id for the current user
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE user_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Check ownership and lock the row to prevent race conditions
  SELECT profile_id INTO v_owner_profile_id
  FROM posts
  WHERE id = p_post_id
  FOR UPDATE;

  IF v_owner_profile_id IS NULL THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  IF v_owner_profile_id != v_profile_id THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Validate status if provided
  IF p_status IS NOT NULL AND p_status NOT IN ('draft', 'published') THEN
    RAISE EXCEPTION 'Invalid status. Must be draft or published';
  END IF;

  -- Get current values for fields not being updated
  SELECT title, excerpt, tags, published_at, status
  INTO v_current_title, v_current_excerpt, v_current_tags, v_db_published_at, v_current_status
  FROM posts
  WHERE id = p_post_id;

  -- Determine final status and published_at
  IF p_status IS NULL THEN
    -- No status change requested: preserve current status and published_at.
    -- Used by rollbackToVersion() which omits both p_status and p_published_at
    -- intentionally so that only content/metadata is restored.
    v_final_status := v_current_status;
    v_final_published_at := COALESCE(p_published_at, v_db_published_at);
  ELSIF p_status = 'draft' THEN
    v_final_status := 'draft';
    v_final_published_at := COALESCE(p_published_at, v_db_published_at);
  ELSE
    -- p_status = 'published': determine actual status based on p_published_at.
    -- NULL p_published_at means "publish immediately" (do not fall back to the
    -- existing DB value, because the UI caller explicitly cleared the date).
    IF p_published_at IS NULL THEN
      v_final_published_at := CURRENT_TIMESTAMP;
      v_final_status := 'published';
    ELSIF p_published_at > CURRENT_TIMESTAMP THEN
      v_final_published_at := p_published_at;
      v_final_status := 'scheduled';
    ELSE
      v_final_published_at := p_published_at;
      v_final_status := 'published';
    END IF;
  END IF;

  -- The effective status is used for version handling logic
  v_effective_status := v_final_status;

  -- Update the post fields that are provided
  UPDATE posts
  SET
    title = COALESCE(p_title, title),
    slug = COALESCE(p_slug, slug),
    excerpt = COALESCE(p_excerpt, excerpt),
    tags = COALESCE(p_tags, tags),
    status = v_final_status,
    published_at = v_final_published_at
  WHERE id = p_post_id;

  -- Update version only if content or metadata changed
  IF p_content IS NOT NULL OR
     p_title IS NOT NULL OR
     p_excerpt IS NOT NULL OR
     p_tags IS NOT NULL THEN

    -- Set version_date to now() if not provided
    v_version_date := COALESCE(p_version_date, now());

    -- Get current content if not provided
    IF p_content IS NULL THEN
      SELECT content INTO v_current_content
      FROM post_versions
      WHERE post_id = p_post_id AND id = (
        SELECT current_version_id FROM posts WHERE id = p_post_id
      );

      IF v_current_content IS NULL THEN
        RAISE EXCEPTION 'Content is required when no existing version is found';
      END IF;
    ELSE
      v_current_content := p_content;
    END IF;

    IF v_effective_status IN ('draft', 'scheduled') AND
       EXISTS (SELECT 1 FROM posts WHERE id = p_post_id AND current_version_id IS NOT NULL) THEN
      -- Overwrite the existing version for draft/scheduled posts.
      -- 'scheduled' is set internally when published_at > CURRENT_TIMESTAMP;
      -- like drafts, scheduled posts should overwrite rather than accumulate versions.
      UPDATE post_versions
      SET
        content = v_current_content,
        title = COALESCE(p_title, v_current_title),
        excerpt = COALESCE(p_excerpt, v_current_excerpt),
        tags = COALESCE(p_tags, v_current_tags),
        change_summary = p_change_summary,
        version_date = v_version_date
      WHERE id = (SELECT current_version_id FROM posts WHERE id = p_post_id);
    ELSE
      -- Create a new version for published posts (or draft/scheduled with no existing version)
      SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_max_version
      FROM post_versions
      WHERE post_id = p_post_id;

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
    END IF;
  END IF;

  RETURN p_post_id;
END;
$$;
