-- Migration: Add work_urls and work_technologies tables
-- This migration creates:
--   - work_urls: links multiple URLs (with labels and sort order) to a work entry
--   - work_technologies: junction table linking works to technologies (many-to-many)
--
-- Depends on: 20260207000000_initial_schema.sql (works table, update_updated_at_column function)
--             20260208000000_add_profile_fields.sql (technologies table)
--             20260209000000_add_write_policies.sql (profile_id on works)

-- Create work_urls table
CREATE TABLE IF NOT EXISTS work_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (char_length(btrim(label)) >= 1),
  url TEXT NOT NULL CHECK (char_length(btrim(url)) >= 1),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for work_urls (composite index covers work_id lookups too)
CREATE INDEX IF NOT EXISTS work_urls_work_id_sort_order_idx ON work_urls(work_id, sort_order);

-- Enable Row Level Security on work_urls
ALTER TABLE work_urls ENABLE ROW LEVEL SECURITY;

-- Public read access for work_urls
CREATE POLICY "Enable read access for all users" ON work_urls
  FOR SELECT
  USING (true);

-- Authenticated users can insert work_urls for their own works
CREATE POLICY "Users can insert their own work URLs" ON work_urls
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM works
      JOIN profiles ON profiles.id = works.profile_id
      WHERE works.id = work_urls.work_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Authenticated users can update work_urls for their own works
CREATE POLICY "Users can update their own work URLs" ON work_urls
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM works
      JOIN profiles ON profiles.id = works.profile_id
      WHERE works.id = work_urls.work_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM works
      JOIN profiles ON profiles.id = works.profile_id
      WHERE works.id = work_urls.work_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Authenticated users can delete work_urls for their own works
CREATE POLICY "Users can delete their own work URLs" ON work_urls
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM works
      JOIN profiles ON profiles.id = works.profile_id
      WHERE works.id = work_urls.work_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create trigger to auto-update updated_at on work_urls
CREATE TRIGGER update_work_urls_updated_at BEFORE UPDATE ON work_urls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create work_technologies junction table (many-to-many: works <-> technologies)
CREATE TABLE IF NOT EXISTS work_technologies (
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (work_id, technology_id)
);

-- Create index for work_technologies (technology_id direction; work_id direction is covered by the PK)
CREATE INDEX IF NOT EXISTS work_technologies_technology_id_idx ON work_technologies(technology_id);

-- Enable Row Level Security on work_technologies
ALTER TABLE work_technologies ENABLE ROW LEVEL SECURITY;

-- Public read access for work_technologies
CREATE POLICY "Enable read access for all users" ON work_technologies
  FOR SELECT
  USING (true);

-- Authenticated users can insert work_technologies for their own works and technologies
CREATE POLICY "Users can insert their own work technologies" ON work_technologies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM works
      JOIN technologies ON technologies.id = work_technologies.technology_id
      JOIN profiles ON profiles.id = works.profile_id
      WHERE works.id = work_technologies.work_id
      AND technologies.profile_id = works.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Authenticated users can delete work_technologies for their own works and technologies
CREATE POLICY "Users can delete their own work technologies" ON work_technologies
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM works
      JOIN technologies ON technologies.id = work_technologies.technology_id
      JOIN profiles ON profiles.id = works.profile_id
      WHERE works.id = work_technologies.work_id
      AND technologies.profile_id = works.profile_id
      AND profiles.user_id = auth.uid()
    )
  );
