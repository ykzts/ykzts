-- Migration: Add RLS write policies for authenticated users
-- This migration adds INSERT, UPDATE, and DELETE policies for authenticated users
-- while maintaining public read access
--
-- SECURITY: Users can only modify their own profile data

-- Add user_id column to profiles table to link with auth.users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create unique index to ensure one profile per user
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON profiles(user_id);

-- Profiles table write policies (users can only modify their own profile)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Works table write policies (users can only modify their own works)
CREATE POLICY "Users can insert their own works" ON works
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = works.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own works" ON works
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = works.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = works.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own works" ON works
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = works.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Posts table write policies (users can only modify their own posts)
CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = posts.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = posts.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = posts.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = posts.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Social links table write policies (users can only modify their own social links)
CREATE POLICY "Users can insert their own social links" ON social_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = social_links.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own social links" ON social_links
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = social_links.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = social_links.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own social links" ON social_links
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = social_links.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Technologies table write policies (users can only modify their own technologies)
CREATE POLICY "Users can insert their own technologies" ON technologies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = technologies.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own technologies" ON technologies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = technologies.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = technologies.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own technologies" ON technologies
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = technologies.profile_id
      AND profiles.user_id = auth.uid()
    )
  );
