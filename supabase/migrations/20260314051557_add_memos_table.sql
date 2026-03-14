-- Migration: Add memos and memo_versions tables
-- Implements a wiki-style memo system with version history
-- Similar to the posts/post_versions pattern, but with path-based hierarchy and visibility control

-- 1. Create memos table (without current_version_id FK initially to avoid circular dependency)
CREATE TABLE IF NOT EXISTS memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_version_id UUID,
  path TEXT NOT NULL UNIQUE,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create memo_versions table
CREATE TABLE IF NOT EXISTS memo_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id UUID NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
  title TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Add FK from memos.current_version_id to memo_versions.id
ALTER TABLE memos
  ADD CONSTRAINT memos_current_version_id_fkey
  FOREIGN KEY (current_version_id) REFERENCES memo_versions(id);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS memos_profile_id_idx ON memos(profile_id);
CREATE INDEX IF NOT EXISTS memos_path_idx ON memos(path);
CREATE INDEX IF NOT EXISTS memos_visibility_idx ON memos(visibility);
CREATE INDEX IF NOT EXISTS memos_published_at_idx ON memos(published_at DESC);
CREATE INDEX IF NOT EXISTS memo_versions_memo_id_idx ON memo_versions(memo_id);

-- 5. Enable Row Level Security
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_versions ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies for memos

-- Public memos are readable by everyone
CREATE POLICY "Public memos are visible to everyone" ON memos
  FOR SELECT
  USING (visibility = 'public');

-- Authenticated users can read their own memos regardless of visibility
CREATE POLICY "Users can read their own memos" ON memos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = memos.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Authenticated users can insert memos under their own profile
CREATE POLICY "Users can insert their own memos" ON memos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = memos.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Authenticated users can update their own memos
CREATE POLICY "Users can update their own memos" ON memos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = memos.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = memos.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Authenticated users can delete their own memos
CREATE POLICY "Users can delete their own memos" ON memos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = memos.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- 7. RLS policies for memo_versions

-- memo_versions are readable if the corresponding memo is readable
CREATE POLICY "Memo versions are visible if the memo is visible" ON memo_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memos
      WHERE memos.id = memo_versions.memo_id
      AND (
        memos.visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = memos.profile_id
          AND profiles.user_id = auth.uid()
        )
      )
    )
  );

-- Only the memo owner can insert versions
CREATE POLICY "Users can insert versions of their own memos" ON memo_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memos
      JOIN profiles ON profiles.id = memos.profile_id
      WHERE memos.id = memo_versions.memo_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Only the memo owner can update versions
CREATE POLICY "Users can update versions of their own memos" ON memo_versions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memos
      JOIN profiles ON profiles.id = memos.profile_id
      WHERE memos.id = memo_versions.memo_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memos
      JOIN profiles ON profiles.id = memos.profile_id
      WHERE memos.id = memo_versions.memo_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Only the memo owner can delete versions
CREATE POLICY "Users can delete versions of their own memos" ON memo_versions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memos
      JOIN profiles ON profiles.id = memos.profile_id
      WHERE memos.id = memo_versions.memo_id
      AND profiles.user_id = auth.uid()
    )
  );

-- 8. Trigger to automatically update updated_at on memos
CREATE TRIGGER update_memos_updated_at
  BEFORE UPDATE ON memos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
