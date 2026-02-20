-- Migration: Fix version accumulation for draft and scheduled posts
-- For draft/scheduled posts, overwrite the existing version instead of creating a new one.
-- Only published posts should accumulate new versions.

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
  v_current_content JSONB;
  v_current_status TEXT;
  v_effective_status TEXT;
  v_db_published_at TIMESTAMPTZ;
  v_final_published_at TIMESTAMPTZ;
  v_version_date TIMESTAMPTZ;
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
  IF p_status IS NOT NULL AND p_status NOT IN ('draft', 'scheduled', 'published') THEN
    RAISE EXCEPTION 'Invalid status. Must be draft, scheduled, or published';
  END IF;

  -- Get current values for fields not being updated
  SELECT title, excerpt, tags, published_at, status INTO v_current_title, v_current_excerpt, v_current_tags, v_db_published_at, v_current_status
  FROM posts
  WHERE id = p_post_id;

  -- Determine effective status after this update
  v_effective_status := COALESCE(p_status, v_current_status);

  -- Determine final published_at value
  IF p_status = 'published' THEN
    -- If no published_at provided and post doesn't have one, set to now()
    IF p_published_at IS NULL THEN
      IF v_db_published_at IS NULL THEN
        v_final_published_at := now();
      ELSE
        v_final_published_at := v_db_published_at;
      END IF;
    ELSE
      v_final_published_at := p_published_at;
    END IF;
  ELSIF p_published_at IS NOT NULL THEN
    v_final_published_at := p_published_at;
  ELSE
    v_final_published_at := v_db_published_at;
  END IF;

  -- Update the post fields that are provided
  UPDATE posts
  SET
    title = COALESCE(p_title, title),
    slug = COALESCE(p_slug, slug),
    excerpt = COALESCE(p_excerpt, excerpt),
    tags = COALESCE(p_tags, tags),
    status = COALESCE(p_status, status),
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
      -- Overwrite the existing version for draft/scheduled posts
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
