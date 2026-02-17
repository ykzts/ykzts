-- Migration: Fix update_updated_at_column trigger to prevent infinite loop
--
-- Problem: The trigger unconditionally updates updated_at to now(), which causes
-- embedding_updated_at < updated_at to remain true even after embedding updates,
-- creating an infinite loop in the embedding cron job.
--
-- Solution: Modify the trigger to preserve updated_at when the application
-- explicitly sets it to a specific value.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  -- If application explicitly set updated_at to its old value, preserve it
  IF NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
    -- Application changed updated_at explicitly, keep that value
    -- Do nothing, NEW.updated_at already has the desired value
  ELSE
    -- Application did not change updated_at, auto-update
    NEW.updated_at = timezone('utc'::text, now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the function behavior
COMMENT ON FUNCTION update_updated_at_column() IS 
  'Automatically updates updated_at to current timestamp on UPDATE, unless the application explicitly sets a different value. This allows embedding updates to preserve timestamps and prevent infinite loops in staleness checks.';
