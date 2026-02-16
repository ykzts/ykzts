-- Migration: Optimize embedding staleness index
-- Replace complex partial index with simpler, more efficient approach

-- Drop the previous complex partial index
DROP INDEX IF EXISTS posts_embedding_outdated_idx;

-- Create simpler partial index for NULL checks (most efficient)
CREATE INDEX IF NOT EXISTS posts_embedding_null_idx 
  ON posts(updated_at DESC) 
  WHERE embedding IS NULL OR embedding_updated_at IS NULL;

-- Add regular index on embedding_updated_at for timestamp comparisons
CREATE INDEX IF NOT EXISTS posts_embedding_updated_at_idx 
  ON posts(embedding_updated_at);

-- Note: For query "WHERE embedding_updated_at < updated_at",
-- the query planner can use posts_embedding_updated_at_idx combined with updated_at
-- This is more efficient than a complex partial index
