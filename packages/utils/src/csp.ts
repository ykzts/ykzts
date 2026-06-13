export type CspValue = string | false | null | undefined;

export interface BuildCspOptions {
  /** Currently unused; reserved for future environment-aware defaults if needed. */
  dev?: boolean;
}

/**
 * Convert camelCase directive names (scriptSrc, imgSrc) to kebab-case (script-src, img-src)
 * so object keys in JS/TS can use the more natural camelCase style.
 */
function toKebabCase(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Normalize a single value or array of values, filtering out falsy/empty entries.
 */
function normalizeCspValues(value: CspValue | CspValue[]): string[] {
  const arr = Array.isArray(value) ? value : [value];
  return arr
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
}

/**
 * Build a Content-Security-Policy header string from a directives object.
 *
 * This is the recommended way to generate CSP in the monorepo so it can be
 * shared, kept consistent, and easily extended (e.g. nonces, more apps).
 *
 * - Directive keys can be camelCase (`scriptSrc`) or kebab-case (`script-src`).
 * - Values can be string or array. Falsy values (`false`, `null`, `undefined`, empty strings) are ignored.
 * - Returns a string ready to use as the `Content-Security-Policy` header value.
 *
 * @example
 * ```ts
 * import { buildCsp, getSupabaseStorageSrc, SELF, NONE, UNSAFE_INLINE, UNSAFE_EVAL } from '@ykzts/utils/csp';
 *
 * const isDevelopment = process.env.NODE_ENV === 'development';
 *
 * const csp = buildCsp({
 *   baseUri: [NONE],
 *   defaultSrc: [NONE],
 *   scriptSrc: [SELF, UNSAFE_INLINE, isDevelopment && UNSAFE_EVAL, 'https://challenges.cloudflare.com'],
 *   styleSrc: [SELF, UNSAFE_INLINE],
 *   imgSrc: getSupabaseStorageSrc(),
 *   connectSrc: [
 *     SELF,
 *     'https://vitals.vercel-insights.com',
 *     'https://challenges.cloudflare.com',
 *     isDevelopment && 'ws:',
 *     isDevelopment && 'wss:',
 *   ],
 *   fontSrc: [SELF],
 *   frameSrc: ['https://challenges.cloudflare.com'],
 *   // etc.
 * });
 * ```
 */
export function buildCsp(
  directives: Record<string, CspValue | CspValue[]>,
  _options: BuildCspOptions = {}
): string {
  const parts: string[] = [];

  for (const [rawKey, rawValue] of Object.entries(directives)) {
    const key = toKebabCase(rawKey);
    const values = normalizeCspValues(rawValue);

    if (values.length === 0) {
      continue;
    }

    parts.push(`${key} ${values.join(" ")}`);
  }

  return parts.join("; ");
}

/**
 * Returns an array of sources for `img-src` (and similar fetch directives)
 * containing 'self', data:, and the Supabase Storage host (if NEXT_PUBLIC_SUPABASE_URL or override is present).
 *
 * Extracted here so the logic is not duplicated and can be reused by any app that sets a CSP.
 */
export function getSupabaseStorageSrc(supabaseUrl?: string): string[] {
  const sources = [SELF, DATA];

  const url = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      sources.push(`${parsed.protocol}//${parsed.host}`);
    } catch {
      // Ignore invalid URL (consistent with previous inline logic)
    }
  }

  return sources;
}

// Common quoted source constants to avoid typos and improve readability in policy objects.
export const SELF = "'self'";
export const NONE = "'none'";
export const UNSAFE_INLINE = "'unsafe-inline'";
export const UNSAFE_EVAL = "'unsafe-eval'";
export const DATA = "data:";
export const BLOB = "blob:";
