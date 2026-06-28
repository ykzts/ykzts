import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDraftPreviewToken,
  getDraftPreviewApiPath,
  getDraftPreviewUrl,
  verifyDraftPreviewToken,
} from "./draft-preview.js";

const SECRET = "test-draft-secret";

describe("createDraftPreviewToken", () => {
  it("creates a verifiable token for a slug", () => {
    const token = createDraftPreviewToken("my-post", SECRET, {
      now: 1_700_000_000,
    });
    const result = verifyDraftPreviewToken(token, SECRET, {
      now: 1_700_000_000,
    });

    expect(result).toEqual({ slug: "my-post" });
  });

  it("rejects expired tokens", () => {
    const token = createDraftPreviewToken("my-post", SECRET, {
      now: 1_700_000_000,
      ttlSeconds: 60,
    });

    expect(
      verifyDraftPreviewToken(token, SECRET, { now: 1_700_000_100 })
    ).toBeNull();
  });

  it("rejects tampered tokens", () => {
    const token = createDraftPreviewToken("my-post", SECRET, {
      now: 1_700_000_000,
    });
    const tampered = `${token}x`;

    expect(
      verifyDraftPreviewToken(tampered, SECRET, { now: 1_700_000_000 })
    ).toBeNull();
  });

  it("rejects invalid ttlSeconds", () => {
    expect(() =>
      createDraftPreviewToken("my-post", SECRET, { ttlSeconds: Number.NaN })
    ).toThrow("ttlSeconds must be a positive integer");
  });

  it("rejects tokens with non-finite exp", () => {
    const encodedPayload = Buffer.from(
      JSON.stringify({
        // biome-ignore lint/correctness/noPrecisionLoss: for testing only.
        exp: 1e309,
        slug: "my-post",
      }),
      "utf8"
    ).toString("base64url");
    const signature = createHmac("sha256", SECRET)
      .update(encodedPayload)
      .digest("base64url");
    const token = `${encodedPayload}.${signature}`;

    expect(
      verifyDraftPreviewToken(token, SECRET, { now: 1_700_000_000 })
    ).toBeNull();
  });

  it("rejects tokens signed with a different secret", () => {
    const token = createDraftPreviewToken("my-post", SECRET, {
      now: 1_700_000_000,
    });

    expect(
      verifyDraftPreviewToken(token, "other-secret", { now: 1_700_000_000 })
    ).toBeNull();
  });
});

const DRAFT_PREVIEW_URL_PATTERN =
  /^https:\/\/example\.com\/api\/blog\/draft\/.+/;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getDraftPreviewUrl", () => {
  it("should generate a full token URL without exposing the secret", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_ORIGIN", "https://example.com");

    const url = getDraftPreviewUrl("my-post", "draft-secret-value");

    expect(url).not.toBeNull();
    expect(url).toMatch(DRAFT_PREVIEW_URL_PATTERN);
    expect(url).not.toContain("secret=");
    expect(url).not.toContain("draft-secret-value");
  });

  it("should return null for invalid inputs", () => {
    expect(getDraftPreviewUrl("", "draft-secret-value")).toBeNull();
    expect(getDraftPreviewUrl("my-post", "")).toBeNull();
  });
});

describe("getDraftPreviewApiPath", () => {
  it("returns a path-based draft preview URL segment", () => {
    const token = createDraftPreviewToken("my-post", SECRET, {
      now: 1_700_000_000,
    });
    const path = getDraftPreviewApiPath(token);

    expect(path.startsWith("/api/blog/draft/")).toBe(true);
    expect(path).not.toContain("secret=");
  });
});
