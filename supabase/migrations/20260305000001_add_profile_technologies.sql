-- Migration: Add profile_technologies junction table (Phase 1)
-- This migration creates the profile_technologies many-to-many junction table
-- between profiles and technologies, and migrates existing data.
--
-- NOTE: This is Phase 1. The existing technologies.profile_id and
-- technologies.sort_order columns are NOT removed in this phase.
--
-- Depends on: 20260208000000_add_profile_fields.sql (technologies table)
--             20260209000000_add_write_policies.sql (RLS write policies pattern)

-- Create profile_technologies junction table
CREATE TABLE IF NOT EXISTS profile_technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT profile_technologies_profile_id_technology_id_key UNIQUE (profile_id, technology_id)
);

-- Create indexes for profile_technologies
CREATE INDEX IF NOT EXISTS profile_technologies_profile_id_idx ON profile_technologies(profile_id);
CREATE INDEX IF NOT EXISTS profile_technologies_technology_id_idx ON profile_technologies(technology_id);

-- Migrate existing data from technologies table
INSERT INTO profile_technologies (profile_id, technology_id, sort_order, created_at, updated_at)
SELECT profile_id, id, sort_order, created_at, updated_at
FROM technologies
ON CONFLICT (profile_id, technology_id) DO NOTHING;

-- Enable Row Level Security on profile_technologies
ALTER TABLE profile_technologies ENABLE ROW LEVEL SECURITY;

-- Public read access for profile_technologies
CREATE POLICY "Enable read access for all users" ON profile_technologies
  FOR SELECT
  USING (true);

-- Authenticated users can insert profile_technologies for their own profile
CREATE POLICY "Users can insert their own profile technologies" ON profile_technologies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_technologies.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Authenticated users can update profile_technologies for their own profile
CREATE POLICY "Users can update their own profile technologies" ON profile_technologies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_technologies.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_technologies.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Authenticated users can delete profile_technologies for their own profile
CREATE POLICY "Users can delete their own profile technologies" ON profile_technologies
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_technologies.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create trigger to auto-update updated_at on profile_technologies
CREATE TRIGGER update_profile_technologies_updated_at BEFORE UPDATE ON profile_technologies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
