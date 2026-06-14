# @ykzts/memo

Next.js memo / lightweight wiki application with public and private visibility.

## Purpose

This application provides a personal memo system (path-based wiki-style pages with version history) at a dedicated deployment. It supports both publicly visible memos and owner-only private memos. The owner can create, edit, and manage memos after authenticating via Supabase Auth. Public memos are readable by anyone without login.

## Features

- **Path-based memos**: Hierarchical unique paths (e.g. `/projects/foo`).
- **Version history**: Every edit creates a `memo_version`; current version is referenced from the memo row.
- **Visibility control**: `public` (visible to everyone) vs `private` (owner only via RLS + app query filters).
- **Draft / owner preview**: After login, draft mode is enabled so the owner sees private memos and can edit.
- **Rich text editing**: Uses the shared `@ykzts/editor` (Lexical) for content.
- **Portable Text**: Content stored as JSONB and rendered with `@portabletext/react`.
- **Supabase Auth**: Login via OAuth providers configured in the Supabase project.
- **Owner-only mutations**: All write operations require a matching owner profile.

## Development

```bash
pnpm dev        # Start development server (port 3101)
pnpm build      # Build for production
pnpm start      # Start production server
```

Visit http://localhost:3101 after login at `/login`.

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

```dotenv
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site Identity
NEXT_PUBLIC_SITE_NAME=example.com
NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3024
```

See `.env.example` for the complete (minimal) list. Memo does **not** require `SUPABASE_SERVICE_ROLE_KEY`, `DRAFT_SECRET`, `CRON_SECRET`, or `REVALIDATE_*` variables.

## Security, Authentication & Public Scope

**Authentication boundary**:
- Public visitors: No authentication. Only `visibility = 'public'` memos (and their versions) are returned by queries and allowed by RLS.
- Owner: Logs in at `/login` (Supabase Auth). On successful callback, `/api/draft` is called which verifies the user via `getUser()` and then calls `const draft = await draftMode(); draft.enable()`. Subsequent requests from the logged-in browser will see private memos.
- All owner actions (create, update, new version, delete) call `getOwnerProfile()` first. If no profile row links the auth user, writes are rejected at the application layer (in addition to RLS).

**RLS + visibility (the source of truth)**:
- `memos` and `memo_versions` have Row Level Security enabled.
- Public SELECT policy: `visibility = 'public'`.
- Owner SELECT (authenticated): any memo belonging to the user's profile.
- All write policies (INSERT/UPDATE/DELETE on both tables) require `profiles.user_id = auth.uid()` via subquery.
- Additional constraints on memo_versions: updates/deletes only allowed while the memo is still private (public memos are append-only).

**No service role**:
- Memo never loads or uses `SUPABASE_SERVICE_ROLE_KEY`. All data access goes through the anon key + user JWT (or public anon for visitors).

**Draft mode**:
- Unlike the blog app's draft preview (which uses a shared `DRAFT_SECRET` capability token for unauthenticated preview links), memo draft mode is **strictly tied to an authenticated owner session**. There is no secret-token bypass.
- `/api/draft/disable` simply calls `const draft = await draftMode(); draft.disable()` (no auth check needed to turn it off).

**CSP**:
- Applies the monorepo baseline + Supabase host (https + wss) in `connect-src` (see `next.config.ts` + `@ykzts/utils/security-headers` and `@ykzts/utils/csp`).

**Proxy / session handling**:
- `proxy.ts` (middleware) uses Supabase SSR to refresh the session cookie on every request. It does **not** perform hard route gating (visibility filtering + RLS are sufficient and keep the app simpler for public content).

**Storage**:
- If memo ever uses image uploads, it reuses the shared `images` bucket policies (owner = auth.uid()).

## Dependencies

### Internal Dependencies
- `@ykzts/editor`: Rich text editor
- `@ykzts/utils`: portable-text, etc.
- `@ykzts/site-config`: site origin / name
- `@ykzts/supabase`: types + server/browser clients + auth helpers (`getCurrentUser`, `getOwnerProfile`)
- `@ykzts/ui`: Card, Button, etc.

### External Dependencies
- `next`, `react`, `react-dom`
- `@portabletext/react`
- `@supabase/ssr`
- `lucide-react`, `sonner`, `tailwindcss`, etc.

## Architecture Notes

- Data model: `memos` (head) + `memo_versions` (content history) + FK from `memos.current_version_id`.
- Queries in Server Components use `createServerClient()` (anon + cookies). Owner checks use cached `getOwnerProfile()`.
- Client components (editor) receive data via props or separate client fetches.
- No cross-app revalidation or cron jobs are used by memo (content is relatively low-traffic and owner-edited).

## Maintenance

When adding new memo-related tables or columns:
1. Write a new timestamped migration in `supabase/migrations/`.
2. Include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`, the appropriate `CREATE POLICY` statements (public read + owner writes), and the required `GRANT` statements for anon/authenticated/service_role (see `20260613000000_add_data_api_grants.sql` pattern).
3. Run `pnpm typegen` (or `cd packages/supabase && pnpm typegen`) after applying.
4. Update any RLS-related comments / docs.