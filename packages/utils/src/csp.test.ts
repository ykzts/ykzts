import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildCsp,
  DATA,
  getSupabaseStorageSrc,
  NONE,
  SELF,
  UNSAFE_EVAL,
  UNSAFE_INLINE,
} from "./csp.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildCsp", () => {
  it("builds a simple policy with kebab-case keys", () => {
    const csp = buildCsp({
      "default-src": [NONE],
      "script-src": [SELF, UNSAFE_INLINE],
    });
    expect(csp).toBe("default-src 'none'; script-src 'self' 'unsafe-inline'");
  });

  it("supports camelCase keys and normalizes them", () => {
    const csp = buildCsp({
      defaultSrc: [NONE],
      scriptSrc: [SELF, UNSAFE_INLINE, "https://example.com"],
    });
    expect(csp).toBe(
      "default-src 'none'; script-src 'self' 'unsafe-inline' https://example.com"
    );
  });

  it("filters falsy values (useful for dev/prod conditionals)", () => {
    const isDev = true;
    const csp = buildCsp({
      scriptSrc: [
        SELF,
        isDev && UNSAFE_EVAL,
        isDev && "https://dev-only.test",
        false,
        null,
        "",
      ],
    });
    expect(csp).toBe("script-src 'self' 'unsafe-eval' https://dev-only.test");
  });

  it("skips directives that end up with no values after filtering", () => {
    const csp = buildCsp({
      defaultSrc: [NONE],
      "report-to": [false],
    });
    expect(csp).toBe("default-src 'none'");
  });

  it("produces the exact style used by the portfolio (with ; separator and spaces)", () => {
    const csp = buildCsp({
      baseUri: [NONE],
      connectSrc: [
        SELF,
        "https://vitals.vercel-insights.com",
        "https://challenges.cloudflare.com",
      ],
      defaultSrc: [NONE],
      imgSrc: [SELF, DATA, "https://example.supabase.co"],
      scriptSrc: [SELF, UNSAFE_INLINE, "https://challenges.cloudflare.com"],
      styleSrc: [SELF, UNSAFE_INLINE],
    });
    expect(csp).toContain("base-uri 'none'");
    expect(csp).toContain(
      "; connect-src 'self' https://vitals.vercel-insights.com https://challenges.cloudflare.com;"
    );
    expect(csp).toContain(
      "; img-src 'self' data: https://example.supabase.co;"
    );
  });
});

describe("getSupabaseStorageSrc", () => {
  it("returns self + data: when no Supabase URL is set", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    expect(getSupabaseStorageSrc()).toEqual([SELF, DATA]);
  });

  it("appends the storage host from env when present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://myproject.supabase.co");
    expect(getSupabaseStorageSrc()).toEqual([
      SELF,
      DATA,
      "https://myproject.supabase.co",
    ]);
  });

  it("respects an explicit url argument (overrides env)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://env.supabase.co");
    expect(getSupabaseStorageSrc("https://override.supabase.co")).toEqual([
      SELF,
      DATA,
      "https://override.supabase.co",
    ]);
  });

  it("ignores invalid URLs gracefully", () => {
    expect(getSupabaseStorageSrc("not-a-url")).toEqual([SELF, DATA]);
  });
});
