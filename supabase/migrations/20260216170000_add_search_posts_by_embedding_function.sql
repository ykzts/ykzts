-- Migration: Add vector search function for semantic post search
-- Phase 2: Search API implementation

-- Create function to search posts by embedding similarity
-- Uses cosine distance for similarity calculation (lower distance = more similar)
-- Returns published posts ordered by relevance
CREATE OR REPLACE FUNCTION search_posts_by_embedding(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.78,
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
BEGIN
  -- Search for similar posts using cosine similarity
  -- Only return published posts (status='published' and published_at <= now)
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
    (1 - (p.embedding <=> query_embedding)) AS similarity
  FROM posts p
  WHERE p.embedding IS NOT NULL
    AND p.status = 'published'
    AND p.published_at IS NOT NULL
    AND p.published_at <= NOW()
    AND (1 - (p.embedding <=> query_embedding)) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION search_posts_by_embedding(vector(1536), FLOAT, INT) IS 
  'Performs semantic search on published posts using vector similarity. Returns posts ordered by relevance with similarity scores.';