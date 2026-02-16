-- Migration: Add function to get posts needing embeddings
-- This function handles column-to-column timestamp comparison that PostgREST cannot do directly

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
  -- 3. Posts where content changed after embedding (embedding_updated_at < updated_at)
  --
  -- Join with post_versions to include current version content
  -- Order by updated_at DESC to prioritize recently updated posts
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.excerpt,
    p.updated_at,
    p.embedding_updated_at,
    jsonb_build_object(
      'content', pv.content,
      'updated_at', pv.updated_at
    ) AS current_version
  FROM posts p
  LEFT JOIN post_versions pv ON p.current_version_id = pv.id
  WHERE p.embedding IS NULL 
     OR p.embedding_updated_at IS NULL 
     OR p.embedding_updated_at < p.updated_at
  ORDER BY p.updated_at DESC
  LIMIT batch_size;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION get_posts_needing_embeddings(INT) IS 
  'Returns posts that need embedding generation or updates. Handles timestamp comparison that PostgREST cannot do directly in query builder.';
