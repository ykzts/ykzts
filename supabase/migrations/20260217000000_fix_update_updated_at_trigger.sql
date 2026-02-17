-- Migration: Fix update_updated_at_column trigger to prevent infinite loop
-- 
-- Problem: The trigger unconditionally updates updated_at to now(), which causes
-- embedding_updated_at < updated_at to remain true even after embedding updates,
-- creating an infinite loop in the embedding cron job.
--
-- Solution: Create a posts-specific trigger that detects embedding-only updates
-- and preserves updated_at in that case.

-- Create specialized trigger function for posts table
CREATE OR REPLACE FUNCTION update_posts_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  -- For embedding-only updates, preserve updated_at to prevent staleness loop
  -- Check if only embedding or embedding_updated_at columns changed
  IF (NEW.embedding IS DISTINCT FROM OLD.embedding OR 
      NEW.embedding_updated_at IS DISTINCT FROM OLD.embedding_updated_at) AND
     NEW.title IS NOT DISTINCT FROM OLD.title AND
     NEW.slug IS NOT DISTINCT FROM OLD.slug AND
     NEW.excerpt IS NOT DISTINCT FROM OLD.excerpt AND
     NEW.status IS NOT DISTINCT FROM OLD.status AND
     NEW.published_at IS NOT DISTINCT FROM OLD.published_at AND
     NEW.tags IS NOT DISTINCT FROM OLD.tags AND
     NEW.redirect_from IS NOT DISTINCT FROM OLD.redirect_from AND
     NEW.profile_id IS NOT DISTINCT FROM OLD.profile_id AND
     NEW.current_version_id IS NOT DISTINCT FROM OLD.current_version_id
  THEN
    -- Only embedding columns changed, preserve updated_at
    RETURN NEW;
  END IF;
  
  -- Normal content update, auto-update timestamp
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace the posts trigger to use the new function
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_posts_updated_at_column();

-- Add comment explaining the function behavior
COMMENT ON FUNCTION update_posts_updated_at_column() IS 
  'Automatically updates updated_at to current timestamp on UPDATE, unless only embedding columns changed. This prevents infinite loops in embedding staleness checks.';
