-- Migration: Fix embedding staleness check to use version_date instead of updated_at
--
-- Problem: Comparing embedding_updated_at with posts.updated_at causes infinite loop
-- because the update_updated_at trigger advances updated_at even for embedding-only updates.
--
-- Solution: Compare embedding_updated_at with post_versions.version_date instead.
-- This accurately reflects when the actual content changed, not when metadata changed.

CREATE OR REPLACE FUNCTION get_posts_needing_embeddings(batch_size INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  updated_at TIMESTAMPTZ,
  embedding_updated_at TIMESTAMPTZ,
  current_version JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER -- Required for cron job to read all posts (bypasses RLS)
SET search_path = public
AS $$
BEGIN
  -- This function is called by the cron job API endpoint at /api/cron/posts/embeddings
  -- which validates the CRON_SECRET header for authorization
  -- SECURITY DEFINER is necessary to allow reading all posts regardless of auth context
  
  -- Return posts that need embeddings generated:
  -- 1. Posts with no embedding (embedding IS NULL)
  -- 2. Posts with no embedding timestamp (embedding_updated_at IS NULL)
  -- 3. Posts where content changed after embedding (embedding_updated_at < version_date)
  --
  -- By comparing with version_date instead of updated_at, we avoid infinite loops
  -- caused by the update_updated_at trigger advancing the timestamp on embedding updates.
  -- Join with post_versions to include current version content and version_date
  -- Order by version_date DESC to prioritize recently updated posts
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.excerpt,
    p.updated_at,
    p.embedding_updated_at,
    CASE
      WHEN pv.id IS NULL THEN NULL
      ELSE jsonb_build_object(
        'content', pv.content,
        'updated_at', pv.updated_at
      )
    END AS current_version
  FROM posts p
  LEFT JOIN post_versions pv ON p.current_version_id = pv.id
  WHERE p.embedding IS NULL 
     OR p.embedding_updated_at IS NULL 
     OR (pv.version_date IS NOT NULL AND p.embedding_updated_at < pv.version_date)
  ORDER BY COALESCE(pv.version_date, p.updated_at) DESC
  LIMIT batch_size;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION get_posts_needing_embeddings(INT) IS 
  'Returns posts that need embedding generation or updates. Compares embedding_updated_at with post_versions.version_date to accurately detect content changes and avoid infinite loops caused by metadata updates.';
