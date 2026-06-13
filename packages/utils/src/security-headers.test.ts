import { afterEach, describe, expect, it, vi } from "vitest";
import { getDefaultCspDirectives } from "./csp.js";
import { getSecurityHeaders } from "./security-headers.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getDefaultCspDirectives (from @ykzts/utils/csp, used with security-headers)", () => {
  it("includes the portfolio baseline directives (in dev)", () => {
    const dirs = getDefaultCspDirectives(true);
    expect(dirs.baseUri).toEqual(["'none'"]);
    expect(dirs.defaultSrc).toEqual(["'none'"]);
    expect(dirs.scriptSrc).toContain("'unsafe-eval'");
    expect(dirs.connectSrc).toContain("ws:");
    expect(dirs.imgSrc).toEqual(["'self'", "data:"]); // no supabase in this stub
  });

  it("omits dev-only in prod mode", () => {
    const dirs = getDefaultCspDirectives(false);
    expect(dirs.scriptSrc).not.toContain("'unsafe-eval'");
    expect(dirs.connectSrc).not.toContain("ws:");
  });
});

describe("getSecurityHeaders", () => {
  it("returns exactly 4 security headers including CSP", () => {
    const headers = getSecurityHeaders();
    expect(headers).toHaveLength(4);
    const keys = headers.map((h) => h.key);
    expect(keys).toContain("Content-Security-Policy");
    expect(keys).toContain("Permissions-Policy");
    expect(keys).toContain("Referrer-Policy");
    expect(keys).toContain("X-Content-Type-Options");
  });

  it("produces a CSP identical in structure to direct buildCsp with baseline (no regression)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    const headers = getSecurityHeaders({ dev: false });
    const cspHeader = headers.find((h) => h.key === "Content-Security-Policy");
    expect(cspHeader).toBeDefined();
    const cspValue = cspHeader?.value ?? "";
    expect(cspValue).toContain("default-src 'none'");
    expect(cspValue).toContain("base-uri 'none'");
    expect(cspValue).toContain("script-src 'self' 'unsafe-inline'");
    expect(cspValue).not.toContain("unsafe-eval");
  });

  it("appends additional sources from cspDirectives (extension use case)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://ex.supabase.co");
    const headers = getSecurityHeaders({
      dev: false,
      cspDirectives: {
        connectSrc: ["https://ex.supabase.co", "wss://ex.supabase.co"],
      },
    });
    const csp =
      headers.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
    expect(csp).toContain(
      "connect-src 'self' https://vitals.vercel-insights.com https://ex.supabase.co wss://ex.supabase.co"
    );
  });

  it("supports kebab-case keys in cspDirectives overrides", () => {
    const headers = getSecurityHeaders({
      dev: false,
      cspDirectives: {
        "frame-src": ["https://example.com"],
      },
    });
    const csp =
      headers.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
    expect(csp).toContain("frame-src https://example.com");
  });
});
