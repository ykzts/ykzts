-- Migration: Add profile fields for comprehensive profile management
-- This migration extends the profiles table with fields for:
-- - Multilingual name support (en/ja)
-- - Multilingual tagline/bio (en/ja)
-- - Email address
-- - Social media links (as JSONB array)
-- - Technologies/skills (as JSONB array)

-- Add new columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_ja TEXT,
  ADD COLUMN IF NOT EXISTS tagline_en TEXT,
  ADD COLUMN IF NOT EXISTS tagline_ja TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb;

-- Add comment to describe the table
COMMENT ON TABLE profiles IS 'User profile information with multilingual support';

-- Add comments to columns
COMMENT ON COLUMN profiles.name_en IS 'Full name in English';
COMMENT ON COLUMN profiles.name_ja IS 'Full name in Japanese';
COMMENT ON COLUMN profiles.tagline_en IS 'Short bio/tagline in English';
COMMENT ON COLUMN profiles.tagline_ja IS 'Short bio/tagline in Japanese';
COMMENT ON COLUMN profiles.email IS 'Contact email address';
COMMENT ON COLUMN profiles.social_links IS 'Array of social media links with label, url, and icon';
COMMENT ON COLUMN profiles.technologies IS 'Array of technology/skill names';

-- Add email validation constraint
ALTER TABLE profiles
  ADD CONSTRAINT email_format_check
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
