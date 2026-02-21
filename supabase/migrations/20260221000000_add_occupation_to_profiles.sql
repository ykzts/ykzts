-- Migration: Add occupation and fediverse creator fields to profiles for metadata generation
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS fediverse_creator TEXT;

COMMENT ON COLUMN profiles.occupation IS 'Professional domain/occupation label for profile';
COMMENT ON COLUMN profiles.fediverse_creator IS 'Fediverse creator handle used for metadata (e.g. user@example.com)';
