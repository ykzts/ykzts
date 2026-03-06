-- Migration: Drop profile_id and sort_order columns from technologies (Phase 3)
-- This migration removes the now-redundant profile_id and sort_order columns
-- from the technologies table, replacing profile_id-based RLS policies with
-- profile_technologies-based validation.
--
-- Prerequisites:
--   - Phase 1 (add profile_technologies junction table) must be complete
--   - Phase 2 (implementation changes) must be complete
--   - All implementations must be using profile_technologies exclusively
--
-- Depends on: 20260305000001_add_profile_technologies.sql

-- Drop old profile_id-based RLS policies on technologies
DROP POLICY IF EXISTS "Users can insert their own technologies" ON technologies;
DROP POLICY IF EXISTS "Users can update their own technologies" ON technologies;
DROP POLICY IF EXISTS "Users can delete their own technologies" ON technologies;

-- Create new RLS policies using profile_technologies for validation

-- INSERT: Allow any authenticated user to insert a technology.
-- Ownership is enforced at the profile_technologies level when linking.
CREATE POLICY "Users can insert technologies" ON technologies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Allow authenticated users to update technologies exclusively linked to their profile.
-- A technology is only updatable if the current user has a link to it AND no other user
-- shares the same technology row, preventing one user's rename from affecting others.
CREATE POLICY "Users can update their own technologies" ON technologies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profile_technologies pt
      JOIN profiles p ON p.id = pt.profile_id
      WHERE pt.technology_id = technologies.id
      AND p.user_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1 FROM profile_technologies pt
      JOIN profiles p ON p.id = pt.profile_id
      WHERE pt.technology_id = technologies.id
      AND p.user_id != auth.uid()
    )
  )
  WITH CHECK (true);

-- DELETE: Allow authenticated users to delete fully orphaned technologies.
-- A technology is orphaned only when neither profile_technologies nor work_technologies
-- reference it, ensuring deletions do not silently cascade through work associations.
CREATE POLICY "Users can delete orphaned technologies" ON technologies
  FOR DELETE
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM profile_technologies pt
      WHERE pt.technology_id = technologies.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM work_technologies wt
      WHERE wt.technology_id = technologies.id
    )
  );

-- Drop indexes on removed columns
DROP INDEX IF EXISTS technologies_profile_id_idx;
DROP INDEX IF EXISTS technologies_sort_order_idx;

-- Drop profile_id and sort_order columns from technologies
ALTER TABLE technologies DROP COLUMN IF EXISTS profile_id;
ALTER TABLE technologies DROP COLUMN IF EXISTS sort_order;
