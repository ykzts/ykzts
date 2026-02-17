-- Migration: Fix update_updated_at_column trigger to prevent infinite loop
--
-- Problem: The trigger unconditionally updates updated_at to now(), which causes
-- embedding_updated_at < updated_at to remain true even after embedding updates,
-- creating an infinite loop in the embedding cron job.
--
-- Solution: Detect embedding-only updates on posts table and skip timestamp update.
-- For other tables and normal updates, continue auto-updating as before.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
DECLARE
  only_embedding_changed boolean;
BEGIN
  -- For posts table, check if only embedding columns changed
  -- Note: This assumes posts table has these columns. If columns don't exist,
  -- the comparison will be handled gracefully by IS NOT DISTINCT FROM
  IF TG_TABLE_NAME = 'posts' THEN
    -- Check if only embedding or embedding_updated_at changed
    -- All other content columns must be unchanged
    -- NOTE: When adding new columns to posts table, add them to this list
    -- to ensure embedding-only updates continue to preserve updated_at
    only_embedding_changed := (
      (NEW.embedding IS DISTINCT FROM OLD.embedding OR 
       NEW.embedding_updated_at IS DISTINCT FROM OLD.embedding_updated_at) AND
      NEW.title IS NOT DISTINCT FROM OLD.title AND
      NEW.slug IS NOT DISTINCT FROM OLD.slug AND
      NEW.excerpt IS NOT DISTINCT FROM OLD.excerpt AND
      NEW.status IS NOT DISTINCT FROM OLD.status AND
      NEW.published_at IS NOT DISTINCT FROM OLD.published_at AND
      NEW.profile_id IS NOT DISTINCT FROM OLD.profile_id AND
      NEW.current_version_id IS NOT DISTINCT FROM OLD.current_version_id AND
      COALESCE(NEW.tags::text, '') = COALESCE(OLD.tags::text, '') AND
      COALESCE(NEW.redirect_from::text, '') = COALESCE(OLD.redirect_from::text, '')
    );
    
    -- If only embedding changed, preserve updated_at
    IF only_embedding_changed THEN
      RETURN NEW;
    END IF;
  END IF;
  
  -- Normal update: auto-update timestamp
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the function behavior
COMMENT ON FUNCTION update_updated_at_column() IS 
  'Automatically updates updated_at to current timestamp on UPDATE. For posts table, skips auto-update when only embedding columns change to prevent infinite loops in embedding staleness checks. When adding columns to posts table, update the column comparison list in this function.';
