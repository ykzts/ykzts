# @ykzts/utils

Generic shared utility functions used across the ykzts monorepo applications.

Domain-specific helpers are published under focused subpath exports (e.g. `@ykzts/utils/csp`, `@ykzts/utils/pagination`, `@ykzts/utils/portable-text`, `@ykzts/utils/fediverse`, `@ykzts/utils/blog-urls`) so that consumers only pay for the dependencies they actually need.

## CSP

```ts
import { buildCsp, getSupabaseStorageSrc, SELF, NONE, UNSAFE_INLINE, UNSAFE_EVAL } from '@ykzts/utils/csp';

// Example: building a strict CSP (used in next.config headers)
const isDev = process.env.NODE_ENV === 'development';

const csp = buildCsp({
  baseUri: [NONE],
  defaultSrc: [NONE],
  scriptSrc: [
    SELF,
    UNSAFE_INLINE,
    isDev && UNSAFE_EVAL,
    'https://challenges.cloudflare.com',
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

See `src/csp.ts` for the full API.

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
