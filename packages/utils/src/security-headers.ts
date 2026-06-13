import {
  buildCsp,
  type CspValue,
  getDefaultCspDirectives,
} from "@ykzts/utils/csp";

/**
 * Options for getSecurityHeaders.
 */
export interface SecurityHeadersOptions {
  /**
   * Additional CSP directive sources (or full overrides).
   * For array-based directives (e.g. connectSrc, imgSrc), provided values are
   * appended to the baseline (for easy per-app extension).
   * For other values, the provided value replaces the baseline.
   * Keys may be camelCase or kebab-case.
   */
  cspDirectives?: Record<string, CspValue | CspValue[]>;
  /**
   * Force development mode (enables 'unsafe-eval' and ws:/wss: in baseline).
   * Defaults to process.env.NODE_ENV === 'development'.
   */
  dev?: boolean;
}

function toCamelCase(key: string): string {
  return key.replace(/-([a-z0-9])/gi, (_, c: string) => c.toUpperCase());
}

/**
 * Builds the standard set of security headers (Content-Security-Policy + others)
 * for use inside a Next.js `headers()` function in next.config.ts.
 *
 * All apps should use this (or extend via cspDirectives) so that CSP and
 * security headers are consistently applied.
 *
 * Baseline matches the prior portfolio implementation exactly.
 * Per-app differences (e.g. adding Supabase host to connect-src for client-side
 * uploads/auth in admin/memo) are achieved by passing cspDirectives.
 *
 * The other headers (Permissions-Policy, Referrer-Policy, X-Content-Type-Options)
 * are always the same strict set.
 *
 * For the CSP directive builder and constants (SELF, NONE, getSupabaseStorageSrc, etc.)
 * import from '@ykzts/utils/csp'.
 */
export function getSecurityHeaders(
  options: SecurityHeadersOptions = {}
): { key: string; value: string }[] {
  const isDevelopment = options.dev ?? process.env.NODE_ENV === "development";

  const baseDirectives = getDefaultCspDirectives(isDevelopment);
  const directives: Record<string, CspValue | CspValue[]> = {
    ...baseDirectives,
  };

  if (options.cspDirectives) {
    for (const [rawKey, provided] of Object.entries(options.cspDirectives)) {
      // Normalize key for internal camelCase storage (baseline uses camelCase keys)
      const key = toCamelCase(rawKey);
      const baseVal = directives[key];
      if (Array.isArray(provided)) {
        let baseArr: CspValue[];
        if (Array.isArray(baseVal)) {
          baseArr = baseVal;
        } else if (baseVal == null) {
          baseArr = [];
        } else {
          baseArr = [baseVal];
        }
        directives[key] = [...baseArr, ...provided];
      } else {
        directives[key] = provided;
      }
    }
  }

  const csp = buildCsp(directives);

  return [
    {
      key: "Content-Security-Policy",
      value: csp,
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), geolocation=(), microphone=()",
    },
    {
      key: "Referrer-Policy",
      value: "no-referrer",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
  ];
}
