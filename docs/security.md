# Security

This document contains the detailed technical security model for the ykzts monorepo.

For the GitHub-facing security policy (vulnerability reporting process, GitHub UI integration), see [`.github/SECURITY.md`](../.github/SECURITY.md).

For high-level architecture, see [architecture.md](./architecture.md).

Per-app "Security, Authentication & Public Scope" sections live in the individual `apps/*/README.md` files.

## Content Security Policy (CSP)

All Next.js applications apply a strict baseline CSP (and related security headers) via the shared helper `@ykzts/utils/security-headers` (which uses `@ykzts/utils/csp`).

### Baseline policy (applied to every route)
- `default-src 'none'`
- `base-uri 'none'`
- `frame-ancestors 'none'`
- `form-action 'none'`
- `script-src 'self' 'unsafe-inline' 'unsafe-eval' (dev only)`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: <supabase-host>`
- `connect-src 'self' https://vitals.vercel-insights.com` (+ dev ws:/wss: + app-specific additions)
- `font-src 'self'`
- Plus: `Permissions-Policy: camera=(), geolocation=(), microphone=()`
- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`

### Per-app differences
- **portfolio + blog (microfrontend composition)**: Baseline only. Supabase usage is server-side or limited to images.
- **admin + memo**: Baseline + Supabase host (https: + wss:) appended to `connect-src`. Required for browser Supabase client (auth, realtime, direct storage uploads via `@ykzts/supabase/image-upload` etc.).
- Admin also augments connect-src dynamically at header time when `NEXT_PUBLIC_SUPABASE_URL` is present.

CSP is enforced via `headers()` in `next.config.ts`. Changes to the baseline must be made in the shared `packages/utils` package.

## Secret Management

The following secrets / environment variables control privileged operations. They must never be committed or exposed to the browser. They are configured per-environment in Vercel (and locally via `.env.local`).

| Secret / Var                    | Apps that consume it                  | Purpose & Threat Model                                                                 | Sensitivity |
|--------------------------------|---------------------------------------|----------------------------------------------------------------------------------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY`    | admin, blog                           | Bypasses **all** RLS. Used only server-side for: cron jobs, draft preview queries, health checks, scheduled publish. Never sent to client. | Critical |
| `DRAFT_SECRET`                 | admin (sets), blog (verifies)         | Allows unauthenticated preview of unpublished posts via `/api/blog/draft?secret=...`. Short-lived capability token embedded in admin-generated preview links. | High |
| `CRON_SECRET`                  | admin (embeddings cron), blog (publish cron) | Bearer token (`Authorization: Bearer <secret>`) protecting `/api/cron/*` endpoints called by Vercel Cron (or equivalent). Prevents unauthorized triggering of expensive AI embedding jobs or publish side-effects. | High |
| `REVALIDATE_SECRET`            | admin (caller), blog + portfolio (verifier) | Header (`x-revalidate-secret`) for cross-app on-demand cache invalidation (`/api/.../revalidate`). Admin calls the public revalidate endpoints of blog/portfolio after content mutations. | High |
| `REVALIDATE_URLS`              | admin                               | Comma-separated list of revalidation endpoint URLs the admin is allowed to call (e.g. blog + portfolio instances). | Medium (config) |
| `OPENAI_API_KEY`               | admin (AI slug/tag gen via Vercel AI Gateway or direct) | Used server-side only for LLM-powered slug and tag generation. Not required in all environments (falls back to local slugify). | High |
| `RESEND_API_KEY`               | portfolio                           | Powers the public contact form email delivery. Server-only. | High |
| `MAIL_FROM_ADDRESS`            | portfolio                           | From address for contact form emails. | Low-Medium |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | all (public reads + client auth in admin/memo) | Public anon key. Combined with RLS policies for safe public + owner-scoped access. | Public / Low (anon key is designed to be public) |

### Guidelines
- Use long, random, environment-specific values (different for preview vs production).
- `DRAFT_SECRET`, `CRON_SECRET`, `REVALIDATE_SECRET` should be treated like API keys / capability tokens.
- `SUPABASE_SERVICE_ROLE_KEY` must only ever appear in server-side code paths (never in client bundles, `NEXT_PUBLIC_*`, or edge functions that can be reached without auth).
- Rotate compromised secrets immediately in Vercel + Supabase dashboard.
- Local development: `scripts/setup-env.sh` populates Supabase local credentials into `.env` files from a running `supabase start`. Other secrets still require manual `.env.example` editing.

See `turbo.json` (global `env` lists for build/test/typegen tasks) and each app's `.env.example`.

## Supabase Security (RLS, Storage, Grants, Service Role)

### Row Level Security (RLS)
- All user-facing tables have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
- **Public read tables** (`profiles`, `works`, `posts`, `social_links`, `technologies`, `key_visuals`, etc.): `CREATE POLICY "Enable read access for all users" ... USING (true);`
- **Owner-only writes**: All `INSERT/UPDATE/DELETE` policies require `profiles.user_id = auth.uid()` (via subquery `EXISTS (...)`). Ownership is enforced at the profile level.
- **Memos (special case)**: `memos.visibility = 'public'` allows anon SELECT. Private memos + all versions require owner profile match. Version updates/deletes are further restricted to private memos only (public memos are append-only history).
- Draft/scheduled posts are filtered in application queries (status or published_at); service role is used only for the authenticated draft preview path.

### Storage Buckets
- `images` (public bucket): Public `SELECT` for all objects. Authenticated owner-only `INSERT/UPDATE/DELETE` (policy checks `owner = auth.uid()`).
- `avatars`: Similar owner-controlled policies (path prefix check on `auth.uid()`).
- Uploads in admin/memo go through client-side Supabase Storage (hence the extra CSP connect-src) but are gated by the above RLS-equivalent storage policies + validation in `@ykzts/supabase/image-validation`.

### Data API Grants (PostgREST / anon / authenticated / service_role)
Newer Supabase projects (and local resets with `auto_expose_new_tables=false`) require explicit `GRANT`s after `CREATE TABLE + ENABLE RLS + POLICIES`.

See the migration `20260613000000_add_data_api_grants.sql`:
- `anon` receives `SELECT` on publicly readable tables.
- `authenticated` and `service_role` receive full CRUD on content tables.
- `service_role` always bypasses RLS regardless of policies (used only from the trusted server processes described above).
- Future tables must include their own `GRANT` statements in the same migration that creates them.

### Service Role Usage (strictly server-side only)
Exposed via `@ykzts/supabase/service-role` (`createServiceRoleClient()`). Consumers today:
- `apps/admin/app/api/cron/posts/embeddings`
- `apps/admin/app/api/health`
- `apps/blog/app/api/blog/draft` (when fetching unpublished for preview)
- `apps/blog/app/api/blog/cron/publish`
- `apps/blog/lib/supabase/posts.ts` (draft path only)
- `packages/supabase` internal helpers (revalidate is **not** service role).

Any new use must be reviewed: the caller must be protected by one of the secret mechanisms above or by Supabase Auth owner checks inside an authenticated route.

## Authentication Boundaries
- **Public apps** (portfolio, blog public views, blog-legacy, public memos): No session required. Anon key + RLS public policies.
- **Owner apps** (admin entire surface, memo editing + private memos): Supabase Auth (session cookie) + profile ownership check (`getCurrentUser` + `getOwnerProfile`). Admin additionally uses hard middleware gate that redirects unauthenticated users before rendering.
- **Draft preview (blog)**: Capability token (`DRAFT_SECRET`) + Next.js draftMode cookie. Does **not** require a logged-in user (intentionally, for sharing previews).
- **Memo draft mode**: Only enabled after successful owner login (tied to auth session, then `draftMode.enable()`).
- Session refresh is handled by `@supabase/ssr` + the proxy/middleware layer in each authenticated app.

## Reporting Security Issues

Detailed reporting instructions (GitHub security advisories process) are maintained in [`.github/SECURITY.md`](../.github/SECURITY.md#reporting-security-issues) so they appear correctly in GitHub's UI. 

In short: report privately via GitHub's security advisory process rather than public issues. Contact the maintainer (@ykzts) directly for sensitive reports if the advisory flow is not suitable.