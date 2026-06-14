# Architecture Overview

This document gives a high-level view of the ykzts monorepo. For security details see [docs/security.md](./security.md). For AI agent / contributor instructions see [AGENTS.md](../AGENTS.md).

## High-Level Components

- **Public user-facing**:
  - `apps/portfolio` — Root site `ykzts.com` (works, profile, about, contact form). Built with Next.js + MDX + React Compiler.
  - `apps/blog` — Blog content mounted at `/blog` (and feeds) via **Vercel Microfrontends**. Next.js App Router, embeddings-powered "similar posts", full-text search, atom, sitemaps.
  - `apps/blog-legacy` — Pure redirect service (301) for historical domains and old paths. Minimal Next.js.

- **Owner-only tools**:
  - `apps/admin` — Full CMS (Next.js). Manages profiles, works, posts (with rich text + AI slug/tag gen), key visuals, avatars. Triggers cross-app revalidation and owns cron embedding jobs.
  - `apps/memo` — Personal memo/wiki (public + private visibility, versioned). Auth required only for editing and viewing private memos.

- **Data & Auth layer**:
  - Supabase (Postgres + Auth + Storage + pgvector).
  - Row Level Security (RLS) + explicit GRANTs are the primary authorization mechanism.
  - Shared package `@ykzts/supabase` provides typed clients, service-role helper, auth utilities, revalidation handler, image upload helpers.

- **Shared frontend packages**:
  - `@ykzts/ui`, `@ykzts/layout`, `@ykzts/editor` (Lexical), `@ykzts/site-config`, `@ykzts/utils` (CSP, security headers, portable-text, etc.), `@ykzts/tsconfig`.

- **Data package**:
  - `profile/` — Static biography text (consumed by portfolio about section).

## Deployment & Composition

- **Microfrontends (portfolio + blog)**: Single production origin (`ykzts.com`). Portfolio is the shell; blog is routed in for `/blog*` and `/api/blog*` paths. In local dev the microfrontends proxy connects `localhost:3000` → `localhost:3001`.
- **Standalone apps**: `admin`, `memo`, `blog-legacy` run and deploy independently.
- **Hosting**: All on Vercel. Analytics on public surfaces.
- **Cache invalidation**: Admin calls revalidate endpoints (protected by `REVALIDATE_SECRET`) on blog and portfolio after owner changes.
- **Scheduled / background**:
  - Vercel Cron in blog: publish scheduled posts (`CRON_SECRET`).
  - Vercel Cron in admin: generate embeddings for new/updated posts (`CRON_SECRET` + service role + AI).

## Data Flow (simplified)

1. Owner edits content in admin (authenticated, service role for heavy ops, client uploads gated by RLS/storage policies).
2. Admin writes to Supabase (posts/works/profiles) → calls revalidate on blog/portfolio.
3. Public visitors hit portfolio/blog (anon key + public RLS policies) → Server Components fetch and render.
4. Blog draft preview: admin generates a secret link → blog enables draft mode (cookie) + uses service role for that request only.
5. Memo: public reads see only `visibility=public`; owner login enables draft mode for private content; all writes owner-checked + RLS.
6. Legacy domains always 301 to current canonical URLs.

## Key Security Invariants (see docs/security.md for full details)

- Service role key is **server-only** and used only behind `CRON_SECRET` / `DRAFT_SECRET` / owner-auth gates.
- Public content never requires secrets.
- CSP is strict and centralized; only admin/memo need extra Supabase connect-src for browser clients.
- All tables have RLS + owner policies derived from `profiles.user_id = auth.uid()`.
- Memos add visibility column + append-only rules for published versions.
- No secrets in client bundles (`NEXT_PUBLIC_*` only for URL + anon key).

## Environment Variable Centralization

See the detailed table and guidelines in [docs/security.md](./security.md#secret-management).

Per-app examples live next to the apps:
- `apps/admin/.env.example`
- `apps/blog/.env.example`
- `apps/portfolio/.env.example`
- `apps/memo/.env.example` (minimal — no service role or cron secrets)
- blog-legacy needs none.

Local bootstrap for Supabase credentials: `scripts/setup-env.sh`.

## Further Reading

- Per-app details + security sections: `apps/*/README.md`
- Supabase schema + policies: `supabase/migrations/*` (especially `*_add_write_policies.sql`, `*_add_memos_table.sql`, `*_create_images_bucket.sql`, `*_add_data_api_grants.sql`)
- Security headers & CSP implementation: `packages/utils/src/{csp,security-headers}.ts` + `packages/utils/README.md`
- Shared Supabase clients: `packages/supabase/src/{server,service-role,proxy,auth,client}.ts`
- Turbo env surface: `turbo.json`
- Microfrontends wiring: `apps/portfolio/microfrontends.json` + the two apps' `next.config.ts`

This architecture prioritizes:
- Strong separation between public content and owner tools.
- RLS as the single source of truth for data access.
- Capability tokens (secrets) only for narrow automation / preview use cases.
- Centralized, auditable security primitives in the `packages/` layer.