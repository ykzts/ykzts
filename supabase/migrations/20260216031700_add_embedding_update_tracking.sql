-- Migration: Add trigger to track posts needing embedding generation
-- Embedding generation will be handled by a background job/cron

-- Add a flag to track if embedding needs to be regenerated
ALTER TABLE posts ADD COLUMN IF NOT EXISTS embedding_needs_update BOOLEAN DEFAULT true;

-- Create index for efficient queries of posts needing embeddings
CREATE INDEX IF NOT EXISTS posts_embedding_needs_update_idx 
  ON posts(embedding_needs_update) 
  WHERE embedding_needs_update = true;

-- Function to mark post as needing embedding update when content changes
CREATE OR REPLACE FUNCTION mark_post_embedding_outdated()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark embedding as needing update if title or content version changes
  IF (TG_OP = 'UPDATE' AND (
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.current_version_id IS DISTINCT FROM NEW.current_version_id
  )) THEN
    NEW.embedding_needs_update := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically mark posts for embedding regeneration
DROP TRIGGER IF EXISTS posts_mark_embedding_outdated ON posts;
CREATE TRIGGER posts_mark_embedding_outdated
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION mark_post_embedding_outdated();

-- Note: Embedding generation will be handled by external service/cron
-- that queries posts WHERE embedding_needs_update = true
-- and updates embedding column + sets embedding_needs_update = false
