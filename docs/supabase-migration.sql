-- Supabase Migration: Create tables for portfolio content management
-- Run this SQL in Supabase SQL Editor or Dashboard

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create works table
-- Content field stores Portable Text format as JSONB for compatibility with @portabletext/react
CREATE TABLE IF NOT EXISTS works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 256),
  slug TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  starts_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS works_starts_at_idx ON works(starts_at DESC);
CREATE INDEX IF NOT EXISTS works_slug_idx ON works(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
-- Profiles: Public read access
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT
  USING (true);

-- Works: Public read access
CREATE POLICY "Enable read access for all users" ON works
  FOR SELECT
  USING (true);

-- Posts: Public read access
CREATE POLICY "Enable read access for all users" ON posts
  FOR SELECT
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at on record changes
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_works_updated_at BEFORE UPDATE ON works
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample work data (Portable Text format)
-- This is an example - replace with your actual content
INSERT INTO works (title, slug, content, starts_at) VALUES
  (
    'Sample Work',
    'sample-work',
    '[
      {
        "_type": "block",
        "children": [
          {
            "_type": "span",
            "text": "This is a sample work description. You can add your content here."
          }
        ],
        "markDefs": [],
        "style": "normal"
      }
    ]'::jsonb,
    '2024-01-01'
  )
ON CONFLICT (slug) DO NOTHING;

-- Generate TypeScript types
-- After running this migration, use Supabase CLI to generate types:
-- npx supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/portfolio/lib/database.types.ts
