-- Migration: Add updated_at column to post_versions table
-- Ensures consistency with other tables (profiles, works, posts)
-- that have both created_at and updated_at columns

-- 1. Add updated_at column to post_versions table
ALTER TABLE post_versions
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- 2. Initialize existing records with created_at values
-- This maintains consistency for historical data
UPDATE post_versions
SET updated_at = created_at;

-- 3. Create trigger to automatically update updated_at on record changes
CREATE TRIGGER update_post_versions_updated_at BEFORE UPDATE ON post_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
