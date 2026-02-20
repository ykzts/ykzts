-- Migration: Fix create_post function overload conflict
-- The migration 20260220000001_simplify_post_status_logic.sql used CREATE OR REPLACE
-- with a 7-parameter signature, but because the parameter count differs from the
-- existing 8-parameter version (which includes p_version_date), PostgreSQL kept both
-- definitions, causing an "ambiguous function" error when calling create_post.
-- Drop the 8-parameter version to resolve the conflict.
DROP FUNCTION IF EXISTS create_post(TEXT, TEXT, TEXT, JSONB, TEXT[], TEXT, TIMESTAMPTZ, TIMESTAMPTZ);
