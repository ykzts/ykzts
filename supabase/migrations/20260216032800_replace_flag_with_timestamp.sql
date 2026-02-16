-- Migration: Replace embedding_needs_update flag with timestamp-based tracking
-- This provides more straightforward comparison with posts.updated_at and post_versions.updated_at

-- Remove the boolean flag approach
DROP TRIGGER IF EXISTS posts_mark_embedding_outdated ON posts;
DROP FUNCTION IF EXISTS mark_post_embedding_outdated();
DROP INDEX IF EXISTS posts_embedding_needs_update_idx;
ALTER TABLE posts DROP COLUMN IF EXISTS embedding_needs_update;

-- Add timestamp column to track when embedding was last updated
ALTER TABLE posts ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS posts_embedding_outdated_idx 
  ON posts(id) 
  WHERE embedding IS NULL OR embedding_updated_at IS NULL OR embedding_updated_at < updated_at;

-- Note: Cron job will query posts WHERE embedding_updated_at IS NULL OR embedding_updated_at < updated_at
-- This approach is more straightforward than boolean flags and provides audit trail
