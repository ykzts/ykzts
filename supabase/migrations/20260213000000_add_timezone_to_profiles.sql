-- Add timezone column to profiles table
-- This allows users to set their preferred timezone for date/time display

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Tokyo' NOT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN profiles.timezone IS 'IANA timezone identifier for user preferred timezone (e.g., Asia/Tokyo, America/New_York)';

-- Add a check constraint to validate common IANA timezone formats
-- This allows standard formats like Area/Location or Area/Location/Sublocation
ALTER TABLE profiles
ADD CONSTRAINT profiles_timezone_format_check
CHECK (
  timezone ~ '^[A-Z][A-Za-z_]+/[A-Z][A-Za-z_]+(/[A-Z][A-Za-z_]+)?$'
  OR timezone = 'UTC'
);
