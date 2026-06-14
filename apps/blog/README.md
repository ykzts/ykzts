# @ykzts/blog

Next.js blog application serving the blog section of ykzts.com.

## Purpose

This application powers the blog section at [ykzts.com/blog](https://ykzts.com/blog/), a personal technical blog. Built with Next.js App Router and Supabase, it delivers pre-rendered pages via React Server Components, integrates Vercel AI SDK for embedding-based recommendations, and follows WCAG-aligned accessibility practices throughout.

## Features

- **App Router**: Next.js with modern routing, layouts, and React Server Components
- **React Compiler**: Enhanced performance with React 19 optimizations
- **Supabase Integration**: PostgreSQL database for article management and storage
- **AI-Powered Similar Posts**: Embedding-based similar article recommendations via Vercel AI SDK
- **Vercel Analytics**: Performance monitoring and user analytics
- **Atom Feed**: Syndication feed generated at `/blog.atom` and tag-specific feeds at `/blog/tags/[tag].atom` (e.g. `/blog/tags/nextjs.atom`)
- **Sitemap**: Auto-generated sitemap at `/blog/sitemap.xml`
- **Full-Text Search**: Article search powered by Supabase
- **Draft Mode**: Preview unpublished posts via secure draft endpoints
- **Theme Switching**: Light/dark mode support via next-themes
- **Syntax Highlighting**: Code blocks rendered with Shiki
- **Portable Text**: Rich text content rendering with `@portabletext/react`
- **Table of Contents**: Auto-generated in-page navigation for long articles
- **Tag Pages**: Articles grouped and browsable by tag
- **Year Archive Pages**: Articles grouped by year with monthly sections and hash navigation
- **Post Navigation**: Previous/next post navigation within the blog

## Development

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm test       # Run unit tests with Vitest
pnpm typegen    # Generate TypeScript types from Next.js
```

## Security, Authentication & Public Scope

**Public scope**:
- All published posts (and metadata, tags, versions for history) are publicly readable. RLS policies on `posts` and `post_versions` grant public `SELECT`.
- No authentication wall on normal blog pages, search, atom feeds, sitemaps, etc.

**Draft preview (privileged but intentionally token-gated)**:
- Unpublished or scheduled posts can be previewed by the owner via admin-generated links.
- The flow: admin calls `/api/blog/draft?secret=${DRAFT_SECRET}&slug=...`. If the secret matches, the endpoint enables draft mode (sets a cookie) and redirects to the draft page.
- Inside draft routes (`/blog/draft/[slug]`), `await draftMode()` is used to check `isEnabled`; if not enabled the page 404s. Data fetching for drafts uses the service-role client (bypassing RLS) only when the draft cookie is present.
- This is a capability-token model (`DRAFT_SECRET`), **not** a login requirement, so previews can be shared with reviewers without giving full admin access.

**Cron jobs (Vercel Cron)**:
- `/api/blog/cron/publish` is protected by `Authorization: Bearer ${CRON_SECRET}`. It uses the service-role client to find and publish scheduled posts, then calls `revalidateTag`.
- Unauthorized calls return 401.

**Revalidation**:
- `/api/blog/revalidate` accepts `x-revalidate-secret` header. Must match `REVALIDATE_SECRET`. Called by the admin app after mutations.

**Service role usage**:
- Only inside the protected draft and cron routes (blog manages its own `SUPABASE_SERVICE_ROLE_KEY` client), and in `lib/supabase/posts.ts` when `isDraft` flag is passed.
- The anon key + RLS is used for all public traffic.

**CSP**: Baseline policy (no extra Supabase connect-src because the blog app does not bundle a browser Supabase client for most features; data is fetched server-side).

**Microfrontends composition**: This app is composed under the portfolio shell. Security headers are primarily controlled at the portfolio level for the combined origin.

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cache Revalidation
REVALIDATE_SECRET=your-secret-key

# Cron Job Secret (for Vercel Cron)
CRON_SECRET=your-cron-secret

# Draft Mode Secret
DRAFT_SECRET=your-draft-secret

# Site Identity
NEXT_PUBLIC_SITE_NAME=example.com
NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3024  # Port assigned by Vercel Microfrontends
```

See `.env.example` for a complete list of required environment variables.

## Dependencies

### Internal Dependencies

- `@ykzts/utils`: Shared utilities (pagination, portable-text, fediverse, blog-urls, csp, ...)
- `@ykzts/site-config`: Shared site origin and name configuration
- `@ykzts/supabase`: Supabase client and type definitions
- `@ykzts/ui`: Shared UI component library

### External Dependencies

- `next`: React framework with App Router
- `react` / `react-dom`: UI framework (v19)
- `@portabletext/react`: Portable Text rich text rendering
- `@supabase/supabase-js`: Supabase database client
- `@vercel/analytics`: Performance and user analytics
- `@vercel/microfrontends`: Microfrontend integration for Vercel
- `ai`: Vercel AI SDK for embedding-based features
- `feed`: Atom/RSS feed generation
- `lucide-react`: Icon component library
- `next-themes`: Light/dark theme switching
- `shiki`: Syntax highlighting for code blocks
- `tailwind-merge`: Utility for merging Tailwind CSS class names
- `zod`: Runtime type validation

## Architecture

- **App Router**: Pages and layouts under `app/` following Next.js App Router conventions
- **Cache Components**: `cacheComponents: true` for improved rendering performance; pages with dynamic segments require `generateStaticParams`
- **React Compiler**: Enabled for automatic memoization and performance optimization
- **Typed Routes**: `typedRoutes: true` ensures route strings are type-checked at compile time
- **CSS Modules / Tailwind CSS**: Component-scoped styles with Tailwind v4 utility classes
- **Server Components**: Data fetching happens in React Server Components; client interactivity is isolated to `'use client'` components
- **Supabase**: Database queries via `@ykzts/supabase` with Row Level Security (RLS)
- **AI Embeddings**: Similar post recommendations computed server-side using vector embeddings
