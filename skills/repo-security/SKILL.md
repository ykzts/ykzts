---
name: repo-security
description: >
  Canonical security model for this monorepo (auth, RLS, grants, service
  role, secrets, CSP/security headers, draft preview, cron, revalidate).
  Use when changing or reviewing security-sensitive code, or when the user
  mentions security, auth, RLS, service role, secrets, CSP, draft mode,
  cron endpoints, revalidate, SUPABASE_SERVICE_ROLE_KEY, DRAFT_SECRET,
  CRON_SECRET, REVALIDATE_SECRET, storage policies, or runs /repo-security.
---

# Repo Security

This skill is the **canonical** technical security model for the ykzts
monorepo. Keep this file updated when the security model, secret surface, or
allowed service-role call sites change.

Do **not** invent new secret names, trust boundaries, or service-role call
sites without aligning to this skill and the packages it points to.

Related (not duplicates of this model):

- GitHub disclosure process: `.github/SECURITY.md`
- High-level architecture: `docs/architecture.md`
- Per-app public vs owner scope: `apps/*/README.md`

## When this skill applies

Load this skill **before** writing or reviewing code that touches any of:

- Supabase Auth, sessions, middleware/proxy gates, owner checks
- RLS policies, storage policies, Data API `GRANT`s, migrations
- `createServiceRoleClient` / `SUPABASE_SERVICE_ROLE_KEY`
- Env secrets: `DRAFT_SECRET`, `CRON_SECRET`, `REVALIDATE_SECRET`,
  `OPENAI_API_KEY`, `RESEND_API_KEY`, etc.
- CSP or security headers (`@ykzts/utils/csp`, `@ykzts/utils/security-headers`)
- Draft preview tokens / Next.js `draftMode`
- Cron routes or on-demand revalidate endpoints
- Client vs server Supabase clients, or anything under `NEXT_PUBLIC_*`

If the task is only UI copy or styling with no data/auth surface, skip.

## Implementation map

Locate real code (do not reimplement helpers):

| Concern | Source of truth |
| --- | --- |
| CSP + headers | `packages/utils/src/csp.ts`, `packages/utils/src/security-headers.ts` |
| Secret compare (cron / revalidate) | `packages/utils/src/secrets.ts` (`@ykzts/utils/secrets`) |
| Draft preview HMAC | `packages/utils/src/draft-preview.ts` |
| Server / browser / service-role clients | `packages/supabase/src/{server,client,service-role,proxy,auth}.ts` |
| Revalidate handler | `packages/supabase/src/revalidate.ts` |
| Image upload validation | `packages/supabase/src/image-validation.ts`, `image-upload.ts` |
| Env surface for Turbo | `turbo.json` + each app's `.env.example` |
| Schema / RLS / grants | `supabase/migrations/*` |

---

## Content Security Policy (CSP)

All Next.js applications apply a strict baseline CSP (and related security
headers) via `@ykzts/utils/security-headers` (which uses `@ykzts/utils/csp`).

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

- **portfolio + blog** (microfrontend composition): Baseline only. Supabase
  usage is server-side or limited to images.
- **admin + memo**: Baseline + Supabase host (https: + wss:) appended to
  `connect-src`. Required for browser Supabase client (auth, realtime,
  direct storage uploads via `@ykzts/supabase/image-upload` etc.).
- Admin also augments `connect-src` dynamically at header time when
  `NEXT_PUBLIC_SUPABASE_URL` is present.

CSP is enforced via `headers()` in each app's `next.config.ts`. Changes to
the baseline must be made in the shared `packages/utils` package. Do not
weaken `default-src 'none'`, `frame-ancestors 'none'`, or `form-action`
without an explicit, reviewed reason.

---

## Secret management

The following secrets / environment variables control privileged operations.
They must never be committed or exposed to the browser. They are configured
per-environment in Vercel (and locally via `.env.local`).

| Secret / Var | Apps that consume it | Purpose & threat model | Sensitivity |
| --- | --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | admin, blog | Bypasses **all** RLS. Used only server-side for: cron jobs, draft preview queries, health checks, scheduled publish. Never sent to client. | Critical |
| `DRAFT_SECRET` | admin (signs), blog (verifies) | Signing key for short-lived HMAC draft preview tokens (`/api/blog/draft/<token>`). The secret value is never embedded in preview URLs. | High |
| `CRON_SECRET` | admin (embeddings cron), blog (publish cron) | Bearer token (`Authorization: Bearer <secret>`) protecting `/api/cron/*` endpoints called by Vercel Cron (or equivalent). Prevents unauthorized triggering of expensive AI embedding jobs or publish side-effects. | High |
| `REVALIDATE_SECRET` | admin (caller), blog + portfolio (verifier) | Header (`x-revalidate-secret`) for cross-app on-demand cache invalidation (`/api/.../revalidate`). Admin calls the public revalidate endpoints of blog/portfolio after content mutations. | High |
| `REVALIDATE_URLS` | admin | Comma-separated list of revalidation endpoint URLs the admin is allowed to call (e.g. blog + portfolio instances). | Medium (config) |
| `OPENAI_API_KEY` | admin (AI slug/tag gen via Vercel AI Gateway or direct) | Used server-side only for LLM-powered slug and tag generation. Not required in all environments (falls back to local slugify). | High |
| `RESEND_API_KEY` | portfolio | Powers the public contact form email delivery. Server-only. | High |
| `MAIL_FROM_ADDRESS` | portfolio | From address for contact form emails. | Low-Medium |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | all (public reads + client auth in admin/memo) | Public anon key. Combined with RLS policies for safe public + owner-scoped access. | Public / Low (anon key is designed to be public) |

### Guidelines

- Use long, random, environment-specific values (different for preview vs production).
- `DRAFT_SECRET`, `CRON_SECRET`, `REVALIDATE_SECRET` should be treated like API keys / capability tokens.
- `SUPABASE_SERVICE_ROLE_KEY` must only ever appear in server-side code paths (never in client bundles, `NEXT_PUBLIC_*`, or edge functions that can be reached without auth).
- Rotate compromised secrets immediately in Vercel + Supabase dashboard.
- Local development: `scripts/setup-env.sh` populates Supabase local credentials into `.env` files from a running `supabase start`. Other secrets still require manual `.env.example` editing.
- Compare secrets with timing-safe helpers from `@ykzts/utils/secrets` (or draft helpers in draft-preview), not `===`.
- Do not put capability secrets in URLs, HTML, RSC props shipped to the client, or logs.

See `turbo.json` (global `env` lists for build/test/typegen tasks) and each app's `.env.example`.

Per-app examples:

- `apps/admin/.env.example`
- `apps/blog/.env.example`
- `apps/portfolio/.env.example`
- `apps/memo/.env.example` (minimal — no service role or cron secrets)
- `blog-legacy` needs none

---

## Supabase security (RLS, storage, grants, service role)

### Row Level Security (RLS)

- All user-facing tables have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
- **Public read tables** (`profiles`, `works`, `posts`, `social_links`,
  `technologies`, `key_visuals`, etc.): open `SELECT` policies where intended
  (e.g. `USING (true)`).
- **Owner-only writes**: All `INSERT` / `UPDATE` / `DELETE` policies require
  `profiles.user_id = auth.uid()` (via subquery `EXISTS (...)`). Ownership is
  enforced at the profile level.
- **Memos (special case)**: `memos.visibility = 'public'` allows anon SELECT.
  Private memos + all versions require owner profile match. Version
  updates/deletes are further restricted to private memos only (public memos
  are append-only history).
- Draft/scheduled posts are filtered in application queries (status or
  `published_at`); service role is used only for the authenticated draft
  preview path.

### Storage buckets

- `images` (public bucket): Public `SELECT` for all objects. Authenticated
  owner-only `INSERT` / `UPDATE` / `DELETE` (policy checks `owner = auth.uid()`).
- `avatars`: Similar owner-controlled policies (path prefix check on
  `auth.uid()`).
- Uploads in admin/memo go through client-side Supabase Storage (hence the
  extra CSP `connect-src`) but are gated by the above storage policies +
  validation in `@ykzts/supabase/image-validation`.
- Do not open write policies to anon.

### Data API grants (PostgREST / anon / authenticated / service_role)

Newer Supabase projects (and local resets with `auto_expose_new_tables=false`)
require explicit `GRANT`s after `CREATE TABLE` + `ENABLE RLS` + policies.

See migration `20260613000000_add_data_api_grants.sql`:

- `anon` receives `SELECT` on publicly readable tables.
- `authenticated` and `service_role` receive full CRUD on content tables.
- `service_role` always bypasses RLS regardless of policies (used only from
  the trusted server processes described below).
- Future tables must include their own `GRANT` statements in the **same**
  migration that creates them. Never assume PostgREST auto-exposes tables.

### Service role usage (strictly server-side only)

Exposed via `@ykzts/supabase/service-role` (`createServiceRoleClient()`).

Consumers today:

- `apps/admin/app/api/cron/posts/embeddings`
- `apps/admin/app/api/health`
- `apps/blog/app/api/blog/draft` (when fetching unpublished for preview)
- `apps/blog/app/api/blog/cron/publish`
- `apps/blog/lib/supabase/posts.ts` (draft path only)
- `packages/supabase` internal helpers (revalidate is **not** service role)

Any new use must be reviewed: the caller must be protected by one of the
secret mechanisms above or by Supabase Auth owner checks inside an
authenticated route. Never import service role into client components,
browser bundles, or `NEXT_PUBLIC_*` paths.

---

## Authentication boundaries

- **Public apps** (portfolio, blog public views, blog-legacy, public memos):
  No session required. Anon key + RLS public policies.
- **Owner apps** (admin entire surface, memo editing + private memos):
  Supabase Auth (session cookie) + profile ownership check (`getCurrentUser` +
  owner profile). Admin additionally uses a hard middleware gate that
  redirects unauthenticated users before rendering.
- **Draft preview (blog)**: Short-lived HMAC token (signed with
  `DRAFT_SECRET`) + Next.js draftMode cookie. Token verification uses
  constant-time signature comparison. Does **not** require a logged-in user
  (intentionally, for sharing previews).
- **Cron / revalidate**: Protected endpoints use `@ykzts/utils/secrets` for
  timing-safe secret comparison.
  - Cron: `Authorization: Bearer <CRON_SECRET>` (admin embeddings, blog publish).
  - Revalidate: `x-revalidate-secret` + `REVALIDATE_SECRET`; admin is caller,
    blog/portfolio verify; admin only calls URLs in `REVALIDATE_URLS`.
- **Memo draft mode**: Only enabled after successful owner login (tied to
  auth session, then `draftMode.enable()`). Unlike blog draft links.
- Session refresh is handled by `@supabase/ssr` + the proxy/middleware layer
  in each authenticated app.

| Surface | Auth model |
| --- | --- |
| portfolio, blog public, blog-legacy, public memos | No session; anon key + RLS public policies |
| admin (all), memo edit + private memos | Supabase Auth cookie + owner profile; admin middleware redirects unauthenticated |
| blog draft preview | HMAC (`DRAFT_SECRET`) + draftMode cookie; not owner login |
| cron / revalidate routes | Shared secret via `@ykzts/utils/secrets` |
| memo draftMode | Enabled only after successful owner login |

---

## Hard rules (never violate)

1. **Service role is critical** — only `@ykzts/supabase/service-role`,
   server-only, gated call sites listed above.
2. **Secrets never go to the client** — including preview URLs and logs.
3. **Public vs privileged env** — browser-safe only
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and other
   intentionally public config). Anon is safe only because RLS + grants enforce access.
4. **RLS is the authorization source of truth** — every user-facing table
   enabled; owner writes via profile; memos visibility rules as above.
5. **New tables / migrations ship complete access control** — RLS + policies
   + GRANTs (+ storage policies if buckets change) in the same migration when possible.
6. **CSP baseline is centralized** in `packages/utils`; apps only compose.
7. **Storage writes stay owner-gated** with validation helpers.
8. **Capability endpoints** keep timing-safe secret checks and allowlists.

---

## Implementation checklist

Before finishing a security-sensitive change, verify:

- [ ] No new service-role usage without a documented gate and server-only import path
- [ ] No privileged env var referenced from client components or `NEXT_PUBLIC_*`
- [ ] Secret comparisons use timing-safe helpers
- [ ] Migrations include RLS + policies + GRANTs (and storage policies if buckets change)
- [ ] CSP changes go through `@ykzts/utils` unless an app-only `connect-src` extension is required (admin/memo pattern)
- [ ] Cron/revalidate/draft routes still reject missing or wrong secrets
- [ ] Public apps still work with anon key only (no accidental service-role dependency on public paths)
- [ ] `.env.example` and `turbo.json` env lists updated if a new variable is introduced
- [ ] **This skill** (`skills/repo-security/SKILL.md`) updated if the security model or allowed call sites changed

---

## Task playbooks

### Add a privileged API route (cron, revalidate, draft, health)

1. Prefer existing patterns in admin/blog `app/api/**`.
2. Gate with the correct secret helper before any side effect or service-role use.
3. Keep handlers server-only; do not export secrets into responses.
4. Update this skill if the route expands service-role or secret surface.

### Add or alter a Supabase table / policy

1. Write migration under `supabase/migrations/`.
2. RLS on → policies → GRANTs in one migration when possible.
3. Mirror ownership patterns from existing content tables or memos as appropriate.
4. Regenerate types (`pnpm typegen` / package scripts) after schema change.
5. Confirm app queries use the right client (anon/server vs service-role).

### Change CSP or security headers

1. Edit `packages/utils` first; run package tests if present
   (`packages/utils` csp/security-headers/secrets tests).
2. Wire app `next.config.ts` only for composition, not forked baselines.
3. admin/memo: only add Supabase connect-src when browser client truly needs it.

### Expose data to the browser

1. Prefer Server Components + server Supabase client for public reads.
2. Browser Supabase client only where auth/realtime/storage require it (admin/memo).
3. Double-check CSP `connect-src` and that RLS denies unintended writes.

---

## Reporting security issues

Detailed reporting instructions are in `.github/SECURITY.md` so they appear
correctly in GitHub's UI.

In short: report privately via GitHub's security advisory process rather than
public issues. Contact the maintainer (@ykzts) directly for sensitive reports
if the advisory flow is not suitable.

---

## Related reading

- `docs/architecture.md` — apps, packages, data flow
- `apps/*/README.md` — per-app security scope
- `.github/SECURITY.md` — disclosure process
- `packages/utils/README.md` — CSP / security-headers usage
- `supabase/migrations/*` — especially write policies, memos, images bucket, data API grants
