-- Migration: Add explicit GRANTs for Data API roles (anon, authenticated, service_role)
--
-- Context:
-- Starting 2026-05-30 new Supabase projects no longer auto-grant table access
-- to the Data API roles. Existing projects keep prior grants until at least
-- 2026-10-30, but *new tables* (and all tables on reset via CLI) require
-- explicit GRANTs.
--
-- Local development with the Supabase CLI is affected immediately once
-- `auto_expose_new_tables = false` (or the future default) is active in
-- config.toml, because `supabase db reset` / `supabase start` will run the
-- equivalent of the dashboard's REVOKE default privileges.
--
-- Without these GRANTs, PostgREST returns:
--   permission denied for table <name>
--   hint: Grant the required privileges ... GRANT SELECT ON public.<name> TO anon;
--
-- RLS policies are **not** a replacement for GRANTs. GRANT controls whether
-- the role can see the table at all.
--
-- This migration grants the roles access to all *currently existing* tables
-- in the public schema (the only objects we expose via Data API).
--
-- It is the *only* place where we adjust exposure for tables created in
-- historical migrations. Past migration files have NOT been modified.
--
-- `supabase db reset` / `start` (with auto_expose_new_tables=false in config.toml)
-- will have already revoked the old default privileges before migrations run.
-- This file (being the latest in lexical order) then grants the necessary
-- privileges so local Data API usage works exactly as before for existing tables.
--
-- For any *new* table added in a future migration (newer timestamp), that
-- migration file itself MUST contain the GRANT statements right after its
-- CREATE TABLE + ENABLE ROW LEVEL SECURITY + CREATE POLICY blocks.
-- This is required for the table to be reachable via supabase-js / PostgREST
-- on every reset.
--
-- See: https://github.com/orgs/supabase/discussions/45329

-- Existing tables (as of 2026-06). Explicit per-table for clarity and reviewability.
-- Publicly readable tables get SELECT for anon; all get full for authenticated + service_role.
-- These are the grants needed for the tables to be reachable via the Data API
-- (PostgREST) after `auto_expose_new_tables = false` + the default privilege revokes.
--
-- NOTE on warnings:
-- You may still see some WARNING (01007) during `supabase db reset` even with per-table grants.
-- This is common and harmless. It occurs when a role already holds the privilege
-- (e.g. from Supabase's internal role setup, PUBLIC grants on functions, or previous
-- grants that weren't fully revoked). The important thing is that the grants we care
-- about for Data API access are applied.
--
-- Future table migrations should still include their own GRANT statements right after
-- CREATE TABLE + RLS + policies.
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.works TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.posts TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.post_versions TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.social_links TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.technologies TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.key_visuals TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.work_urls TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.work_technologies TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profile_technologies TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.memos TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.memo_versions TO anon, authenticated, service_role;
