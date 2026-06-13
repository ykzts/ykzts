# @ykzts/utils

Generic shared utility functions used across the ykzts monorepo applications.

## Usage

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

CSP helpers live under the focused subpath `@ykzts/utils/csp` so the main `@ykzts/utils` entry stays generic.

See `src/csp.ts` for the full API.
