# @ykzts/utils

Generic shared utility functions used across the ykzts monorepo applications.

Domain-specific helpers are published under focused subpath exports (e.g. `@ykzts/utils/csp`, `@ykzts/utils/security-headers`, `@ykzts/utils/pagination`, `@ykzts/utils/portable-text`, `@ykzts/utils/fediverse`, `@ykzts/utils/blog-urls`) so that consumers only pay for the dependencies they actually need.

## CSP and Security Headers

```ts
import { buildCsp, getSupabaseStorageSrc, getSupabaseHost, SELF, NONE, UNSAFE_INLINE, UNSAFE_EVAL } from '@ykzts/utils/csp';

// Example: building a strict CSP (used in next.config headers)
const isDev = process.env.NODE_ENV === 'development';

const csp = buildCsp({
  baseUri: [NONE],
  defaultSrc: [NONE],
  scriptSrc: [
    SELF,
    UNSAFE_INLINE,
    isDev && UNSAFE_EVAL,
  ],
  imgSrc: getSupabaseStorageSrc(),
  connectSrc: [
    SELF,
    'https://vitals.vercel-insights.com',
    isDev && 'ws:',
    isDev && 'wss:',
  ],
  // ...
});
```

### Applying security headers (recommended)

Use the shared `getSecurityHeaders()` helper in every app's `next.config.ts` to ensure consistent
CSP + `Permissions-Policy` / `Referrer-Policy` / `X-Content-Type-Options` across the monorepo.

```ts
// next.config.ts
import { getSecurityHeaders } from '@ykzts/utils/security-headers';

const nextConfig: NextConfig = {
  // ...
  headers() {
    return Promise.resolve([
      {
        source: '/:path*',
        headers: getSecurityHeaders(),
      },
    ]);
  },
};
```

- Baseline policy is the same strict set originally used by the portfolio app (`default-src 'none'`, `base-uri 'none'`, etc. + dev-only `unsafe-eval`/`ws:`).
- App-specific extensions are easy via `cspDirectives` (additions to array directives like `connectSrc` are appended to the baseline):

```ts
// Example for admin/memo (client-side Supabase uploads + possible realtime)
import { getSupabaseHost } from '@ykzts/utils/csp';
import { getSecurityHeaders } from '@ykzts/utils/security-headers';

headers() {
  const host = getSupabaseHost();
  return Promise.resolve([{
    source: '/:path*',
    headers: getSecurityHeaders({
      cspDirectives: host ? { connectSrc: [host, host.replace(/^https:/, 'wss:')] } : undefined,
    }),
  }]);
}
```

**Per-app policy differences (documented here for review):**

- **portfolio**: Exact baseline (Vercel Analytics + botid bot protection + Supabase images). No extra connect-src for Supabase (server fetches + prior state preserved).
- **blog**: Baseline (via microfrontends composition with portfolio). No client-bundled Supabase browser client currently.
- **admin**: Baseline + Supabase host (https + wss) in `connect-src` (required for client uploads via `@ykzts/supabase/client` and editor flows). Uses service-role + AI on server (not affected by page CSP).
- **memo**: Baseline + Supabase host (https + wss) in `connect-src` (client uploads and data sync).

This centralizes development-mode conditionals and makes future nonce/report-to easier.

See `src/csp.ts` for the full API (also includes `getDefaultCspDirectives`, `getSupabaseHost`).

## Pagination

```ts
import { getVisiblePages } from '@ykzts/utils/pagination';

const { pages, showStartEllipsis, showEndEllipsis } = getVisiblePages(currentPage, totalPages);
```

## Portable Text

```ts
import {
  extractFirstParagraph,
  portableTextToHTML,
  portableTextToMarkdown,
  parseMarkdownForPost,
} from '@ykzts/utils/portable-text';
```

## Fediverse

```ts
import { verifyFediverseHandle, extractFediverseHandleFromURL } from '@ykzts/utils/fediverse';
```
