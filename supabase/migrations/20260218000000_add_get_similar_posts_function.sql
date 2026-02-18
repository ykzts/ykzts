-- Migration: Add get_similar_posts function for similar article recommendations
-- Phase 4: Similar posts logic implementation

-- Create function to get similar posts based on a specific post's embedding
-- Uses cosine distance for similarity calculation (lower distance = more similar)
-- Returns published posts ordered by similarity, excluding the current post
CREATE OR REPLACE FUNCTION get_similar_posts(
  post_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  published_at TIMESTAMPTZ,
  tags TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  post_embedding vector(1536);
BEGIN
  -- Get the embedding of the specified post
  SELECT embedding INTO post_embedding
  FROM posts
  WHERE posts.id = post_id
    AND embedding IS NOT NULL;

  -- Return empty result if post not found or has no embedding
  IF post_embedding IS NULL THEN
    RETURN;
  END IF;

  -- Search for similar posts using cosine similarity
  -- Only return published posts (status='published' and published_at <= now)
  -- Exclude the current post itself
  -- Convert cosine distance to similarity score (1 - distance)
  -- Filter by similarity threshold to ensure quality results
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.published_at,
    p.tags,
    (1 - (p.embedding <=> post_embedding)) AS similarity
  FROM posts p
  WHERE p.id != post_id
    AND p.embedding IS NOT NULL
    AND p.status = 'published'
    AND p.published_at IS NOT NULL
    AND p.published_at <= NOW()
    AND (1 - (p.embedding <=> post_embedding)) > match_threshold
  ORDER BY p.embedding <=> post_embedding
  LIMIT match_count;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION get_similar_posts(UUID, FLOAT, INT) IS 
  'Finds similar published posts based on vector similarity to a given post. Returns posts ordered by relevance with similarity scores, excluding the source post itself.';
