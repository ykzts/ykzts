-- Migration: Add embedding staleness tracking with timestamp
-- Tracks when embeddings were last updated for automatic regeneration

-- Add timestamp column to track when embedding was last updated
ALTER TABLE posts ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- Create partial index for NULL embeddings (most efficient for new posts)
CREATE INDEX IF NOT EXISTS posts_embedding_null_idx 
  ON posts(updated_at DESC) 
  WHERE embedding IS NULL OR embedding_updated_at IS NULL;

-- Create index for timestamp comparisons (for staleness detection)
CREATE INDEX IF NOT EXISTS posts_embedding_updated_at_idx 
  ON posts(embedding_updated_at);

-- Note: Cron job queries posts WHERE embedding_updated_at IS NULL OR embedding_updated_at < updated_at
-- This provides straightforward staleness detection and audit trail
