-- Migration: Add key_visuals table and key_visual_id to profiles
-- This migration creates the key_visuals table for managing key visual image metadata
-- and adds a foreign key reference from profiles to key_visuals.
--
-- Depends on: 20260207000000_initial_schema.sql (update_updated_at_column function)

-- Create key_visuals table
CREATE TABLE IF NOT EXISTS key_visuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL CHECK (char_length(btrim(url)) >= 1),
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  artist_name TEXT,
  artist_url TEXT,
  attribution TEXT,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE key_visuals ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Enable read access for all users" ON key_visuals
  FOR SELECT
  USING (true);

-- Authenticated users can insert key visuals
CREATE POLICY "Authenticated users can insert key visuals" ON key_visuals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update key visuals
CREATE POLICY "Authenticated users can update key visuals" ON key_visuals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete key visuals
CREATE POLICY "Authenticated users can delete key visuals" ON key_visuals
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_key_visuals_updated_at BEFORE UPDATE ON key_visuals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add key_visual_id column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS key_visual_id UUID REFERENCES key_visuals(id) ON DELETE SET NULL;

-- Create index for the foreign key
CREATE INDEX IF NOT EXISTS profiles_key_visual_id_idx ON profiles(key_visual_id);
