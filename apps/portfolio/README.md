# @ykzts/portfolio

Next.js portfolio website showcasing projects, skills, and professional experience.

## Purpose

This application powers [ykzts.com](https://ykzts.com/), a professional portfolio website that showcases software development projects, technical skills, and professional experience. Built with Next.js and featuring modern web technologies, it provides a fast, responsive, and accessible platform for professional presentation.

## Usage

### Development

```bash
pnpm dev        # Start development server with Turbopack
pnpm build      # Build for production
pnpm start      # Start production server
pnpm typegen    # Generate TypeScript types from Next.js
pnpm lighthouse # Run Lighthouse CI performance audit
```

### Testing

```bash
pnpm test       # Run unit tests with Vitest
pnpm test:a11y  # Run accessibility tests with Playwright
pnpm lighthouse # Run Lighthouse CI performance audit
```

### Key Features

- **App Router**: Next.js with modern routing and layouts
- **React Compiler**: Enhanced performance with React 19 optimizations
- **MDX Support**: Rich content authoring with React components
- **Supabase Integration**: PostgreSQL database with dynamic content management for portfolio entries
- **Contact Form**: Secure contact form with Resend email service and botid spam prevention
- **Vercel Analytics**: Performance monitoring and user analytics
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Content Integration

- **Portfolio Works**: Dynamic content from Supabase PostgreSQL database
- **About Section**: MDX-based content with interactive components
- **Contact Form**: Server-side form processing with email notifications
- **Go Package Redirects**: Special routing for Go package documentation

## Security, Authentication & Public Scope

**Public scope**: The entire site is public. No authentication is required or supported for visitors. All portfolio data (`works`, public profile fields, etc.) is read via the Supabase anon key. RLS policies grant public `SELECT` on the relevant tables.

**No privileged secrets for visitors**:
- The contact form uses server-only `RESEND_API_KEY` and `MAIL_FROM_ADDRESS` (processed in a Server Action). Visitor input is never persisted to the database.
- `REVALIDATE_SECRET` is accepted only on the internal `/api/revalidate` endpoint (header `x-revalidate-secret`). It is called by the admin app to invalidate caches after the owner publishes changes. The secret is never exposed to browsers.

**Service role**: Portfolio does **not** use or configure `SUPABASE_SERVICE_ROLE_KEY`. All reads use the anon client.

**CSP and security headers**:
- Strict baseline applied via `@ykzts/utils/security-headers` on every route (see `next.config.ts`).
- No Supabase host added to `connect-src` (Supabase calls for content and images are performed from Server Components or use only public image URLs).
- Additional protections: botid for the contact form (spam), Permissions-Policy restrictions, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`.

**Microfrontends**: Portfolio acts as the host application. The blog app is mounted under `/blog` routes at the edge. Security policy for the composed site is controlled here.

**Image assets**: Served from Supabase Storage `images` / `avatars` buckets (public read + owner-controlled write policies on storage objects).

## Environment Variables

The application requires the following environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Cache Revalidation
REVALIDATE_SECRET=your-secret-key

# Site Identity
NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3024
NEXT_PUBLIC_SITE_NAME=example.com

# Optional: portfolio top page description for SEO
NEXT_PUBLIC_PORTFOLIO_DESCRIPTION=

# Mail Sender (Resend)
RESEND_API_KEY=your-resend-api-key
MAIL_FROM_ADDRESS=no-reply@example.com
```

See `.env.example` for a complete list of required environment variables.

## Dependencies

### Internal Dependencies
- `@ykzts/tsconfig`: TypeScript configuration (next.json preset)

### External Dependencies
- `next`: React framework with App Router (v16)
- `react`: UI framework (v19)
- `@portabletext/react`: Portable Text rich text rendering (compatible with Supabase JSONB storage)
- `@supabase/supabase-js`: Supabase PostgreSQL database client
- `@vercel/analytics`: Performance and user analytics
- `botid`: Bot detection / spam prevention for contact form
- `lucide-react`: Icon components library
- `resend`: Email delivery service
- `sonner`: Toast notifications
- `zod`: Runtime type validation

### Dev Dependencies
- `typescript`: Type checking and development tooling
- `@next/mdx`: Next.js MDX integration
- `@mdx-js/loader`: MDX compilation for Webpack
- `babel-plugin-react-compiler`: React 19 performance optimizations
- `@types/mdx`: TypeScript definitions for MDX
- `@lhci/cli`: Lighthouse CI for automated performance auditing
- `@playwright/test`: End-to-end and accessibility testing
- `@axe-core/playwright`: Accessibility testing integration
- `vitest`: Fast unit testing framework
- `tailwindcss`: Utility-first CSS framework (v4)
- `@tailwindcss/postcss`: PostCSS plugin for Tailwind v4
- `@tailwindcss/typography`: Typography plugin for Tailwind CSS
- `postcss`: CSS transformation tool

## Architecture

- **Static Generation**: Pre-rendered pages for optimal performance
- **Image Optimization**: Next.js Image component with automatic optimization
- **Tailwind CSS**: Utility-first styling with Tailwind v4
- **TypeScript**: Full type safety throughout the application
- **Component-Based**: Reusable UI components with proper separation of concerns

## Performance & Quality

This application maintains high performance and quality standards through:

### Lighthouse CI Integration
- **Automated Audits**: Lighthouse CI runs on every PR via GitHub Actions
- **Performance Thresholds**: Minimum score of 95 for Performance, Best Practices, SEO, and Accessibility
- **Continuous Monitoring**: Ensures no performance regressions over time

### Optimization Strategies
- **Image Optimization**: AVIF and WebP formats with Next.js Image component
- **Font Loading**: Optimized Google Fonts with `font-display: swap`
- **Code Splitting**: Automatic with CSS Modules and Next.js
- **Lazy Loading**: Suspense boundaries for non-critical content
- **Security Headers**: CSP, Permissions-Policy, and other security headers
- **React Compiler**: Enhanced performance with React 19 compiler
- **Partial Prerendering (PPR)**: Next.js experimental feature for improved performance

### CI/CD Quality Gates
- **Node.js CI**: Runs build, tests, and linting on every PR
- **Accessibility Testing**: Automated WCAG compliance checks with axe-core
- **Lighthouse CI**: Performance, Best Practices, SEO, and Accessibility audits
