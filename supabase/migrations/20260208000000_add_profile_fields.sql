-- Migration: Add profile fields and related tables
-- This migration extends the profiles table and creates separate tables for social links and technologies

-- Add new columns to profiles table (Japanese only)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS about JSONB;

-- Add comment to describe the table
COMMENT ON TABLE profiles IS 'User profile information';

-- Add comments to columns
COMMENT ON COLUMN profiles.name IS 'Full name';
COMMENT ON COLUMN profiles.tagline IS 'Short bio/tagline';
COMMENT ON COLUMN profiles.email IS 'Contact email address';
COMMENT ON COLUMN profiles.about IS 'About/bio section content in Portable Text format';

-- Add email validation constraint (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'email_format_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT email_format_check
      CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Create social_links table
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  icon TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create technologies table
CREATE TABLE IF NOT EXISTS technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS social_links_profile_id_idx ON social_links(profile_id);
CREATE INDEX IF NOT EXISTS social_links_sort_order_idx ON social_links(sort_order);
CREATE INDEX IF NOT EXISTS technologies_profile_id_idx ON technologies(profile_id);
CREATE INDEX IF NOT EXISTS technologies_sort_order_idx ON technologies(sort_order);

-- Enable Row Level Security (RLS)
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Enable read access for all users" ON social_links
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users" ON technologies
  FOR SELECT
  USING (true);

-- Create triggers to update updated_at on record changes
CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technologies_updated_at BEFORE UPDATE ON technologies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
