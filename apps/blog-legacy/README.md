# @ykzts/blog-legacy

Legacy URL redirect application for the historical blog domains.

## Purpose

`blog-legacy` is a lightweight Next.js application that exists to preserve old inbound links and permanently redirect them to the current site structure.

This app is assigned to legacy domains such as:

- `overknee.info`
- `memo.overknee.info`
- `blog.desire.sh`
- `ykzts.blog`

Redirect targets are primarily under:

- `https://ykzts.com/`
- `https://ykzts.com/blog`

All redirects are handled as `301` and are defined in TypeScript.

## Usage

### Development

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm typegen    # Generate Next.js route types
```

## How Redirects Work

- Redirect rules are defined in `redirects.ts` as tuples:
	- `[source, destination]`
- `next.config.ts` maps these rules to Next.js `redirects()` and applies status code `301`.
- `destination` values are path-based and resolved against `baseUrl`.
- A catch-all rule forwards unknown legacy paths to `/blog/:path*`.

## Files

- `next.config.ts`: Next.js runtime configuration and redirect mapping
- `redirects.ts`: Source of truth for legacy redirect rules
- `vercel.json`: Platform-level minimal settings (`trailingSlash`)
- `app/layout.tsx`: Minimal app shell
- `app/not-found.tsx`: Fallback response

## Maintenance

When adding or adjusting redirects:

1. Edit `redirects.ts`
2. Keep redirects permanent (`301`) unless there is a strong reason otherwise
3. Run `pnpm typegen`
4. Verify expected behavior in local dev or preview deployment

## Dependencies

### Internal Dependencies
- `@ykzts/tsconfig`

### External Dependencies
- `next`
- `react`
- `react-dom`
- `@vercel/analytics`

### Dev Dependencies
- `typescript`
- `@types/node`
- `@types/react`
- `@types/react-dom`

## Configuration

- **Base URL**: `https://ykzts.com` (configured in `next.config.ts`)
- **Redirect Policy**: Permanent redirects (`301`)
- **Trailing Slash**: Disabled (`trailingSlash: false`)
