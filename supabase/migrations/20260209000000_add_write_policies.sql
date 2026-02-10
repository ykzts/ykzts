-- Migration: Add RLS write policies for authenticated users
-- This migration adds INSERT, UPDATE, and DELETE policies for authenticated users
-- while maintaining public read access
--
-- SECURITY NOTE: These policies currently allow ANY authenticated user to write.
-- For production use with multiple users, restrict to admin role:
-- Example: WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
-- Or restrict to specific user ID: WITH CHECK (auth.uid() = '<YOUR_ADMIN_UUID>')
--
-- For single-user admin scenarios, ensure OAuth is configured to only allow
-- your specific GitHub account via Supabase Auth settings.

-- Profiles table write policies
CREATE POLICY "Enable insert access for authenticated users" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON profiles
  FOR DELETE
  TO authenticated
  USING (true);

-- Works table write policies
CREATE POLICY "Enable insert access for authenticated users" ON works
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON works
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON works
  FOR DELETE
  TO authenticated
  USING (true);

-- Posts table write policies
CREATE POLICY "Enable insert access for authenticated users" ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Social links table write policies
CREATE POLICY "Enable insert access for authenticated users" ON social_links
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON social_links
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON social_links
  FOR DELETE
  TO authenticated
  USING (true);

-- Technologies table write policies
CREATE POLICY "Enable insert access for authenticated users" ON technologies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON technologies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON technologies
  FOR DELETE
  TO authenticated
  USING (true);
