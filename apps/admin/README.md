# Admin Application

Content management admin application built with Next.js and Supabase.

## Features

- Authentication with Supabase Auth
- Admin pages for managing:
  - Profiles
  - Works
  - Posts
- Row Level Security (RLS) for data protection
- **AI-Powered Slug Generation**: Automatically generates SEO-friendly URL slugs using OpenAI's GPT-4o-mini
  - Supports Japanese content translation to English slugs
  - Content-aware generation based on title and article body
  - Automatic duplicate checking via tool calling
  - Fallback to traditional slugify for reliability

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit http://localhost:3100/admin

## Security, Authentication & Public Scope

**Authentication boundary**: The entire application (except `/login` and auth callback) is protected. Middleware (`proxy.ts`) using `@ykzts/supabase/proxy` (`updateSession`) checks for a valid Supabase session on every request and redirects unauthenticated visitors to `/login`. Only the single owner profile is expected to have a linked `auth.users` row.

**Privileged operations**:
- Server-side `SUPABASE_SERVICE_ROLE_KEY` (via `createServiceRoleClient()`) is used for:
  - Cron embedding generation (`/api/cron/posts/embeddings` — protected by `CRON_SECRET` Bearer token).
  - Health check (`/api/health`).
  - Invoking blog's protected draft preview endpoints via `/api/blog/draft/<token>` where the token is a short-lived HMAC signature created with `DRAFT_SECRET` (the secret itself is never embedded in URLs). Blog manages its own service-role client for draft queries.
- Revalidation of blog/portfolio caches is performed by calling the revalidate endpoints with `REVALIDATE_SECRET` header (URLs are allow-listed in `REVALIDATE_URLS`).
- AI calls (slug/tag generation) run server-side only.

**Client-side usage**:
- Browser Supabase client is used only for authenticated uploads (avatars, key visuals, post images). RLS policies + storage `owner = auth.uid()` checks prevent other users from writing or overwriting content.
- All table writes from the UI ultimately go through Server Actions that re-check `getCurrentUser()` + profile ownership.

**Public surface**: None. This app is never linked from the public portfolio or blog.

**CSP**: Baseline + Supabase host (https + wss) added to `connect-src` for client uploads and potential realtime.

## Environment Variables

Copy `.env.example` to `.env.local` and set the following values:

```dotenv
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Cache Revalidation
# Comma-separated list of full revalidation endpoint URLs
REVALIDATE_SECRET=your-secret-key
REVALIDATE_URLS=http://localhost:3001/api/blog/revalidate,http://localhost:3000/api/revalidate

# Cron Job Security
CRON_SECRET=your-cron-secret

# Draft Preview
DRAFT_SECRET=your-draft-secret

# Site Identity
NEXT_PUBLIC_SITE_NAME=example.com
NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3024

# Optional AI provider key (depending on your AI Gateway/provider setup)
OPENAI_API_KEY=
```

AI features (slug generation, embeddings) use Vercel AI Gateway.
