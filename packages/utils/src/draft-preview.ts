import { createHmac, timingSafeEqual } from "node:crypto";
import { getSiteOrigin } from "@ykzts/site-config";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24;

interface DraftPreviewPayload {
  exp: number;
  slug: string;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

function timingSafeEqualBase64Url(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "base64url");
  const bufferB = Buffer.from(b, "base64url");

  if (bufferA.length !== bufferB.length) {
    timingSafeEqual(bufferA, bufferA);
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

function isPositiveInteger(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value > 0;
}

function parsePayload(encodedPayload: string): DraftPreviewPayload | null {
  try {
    const parsed: unknown = JSON.parse(base64UrlDecode(encodedPayload));

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "slug" in parsed &&
      "exp" in parsed &&
      typeof parsed.slug === "string" &&
      typeof parsed.exp === "number" &&
      isPositiveInteger(parsed.exp) &&
      parsed.slug.length > 0
    ) {
      return { exp: parsed.exp, slug: parsed.slug };
    }
  } catch {
    return null;
  }

  return null;
}

export interface CreateDraftPreviewTokenOptions {
  /** Override "now" for tests. */
  now?: number;
  /** Token lifetime in seconds. Defaults to 24 hours. */
  ttlSeconds?: number;
}

/**
 * Create a short-lived HMAC-signed draft preview token.
 * DRAFT_SECRET is used as the signing key; the secret itself is never embedded in URLs.
 */
export function createDraftPreviewToken(
  slug: string,
  secret: string,
  options: CreateDraftPreviewTokenOptions = {}
): string {
  const trimmedSlug = slug.trim();
  if (!(trimmedSlug && secret)) {
    throw new Error("slug and secret are required");
  }

  const now = options.now ?? Math.floor(Date.now() / 1000);
  const ttlSeconds = options.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  if (!isPositiveInteger(ttlSeconds)) {
    throw new Error("ttlSeconds must be a positive integer");
  }

  const payload: DraftPreviewPayload = {
    exp: now + ttlSeconds,
    slug: trimmedSlug,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export interface VerifyDraftPreviewTokenOptions {
  /** Override "now" for tests. */
  now?: number;
}

/**
 * Verify a draft preview token and return the encoded slug when valid.
 */
export function verifyDraftPreviewToken(
  token: string,
  secret: string,
  options: VerifyDraftPreviewTokenOptions = {}
): { slug: string } | null {
  if (!(token && secret)) {
    return null;
  }

  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0 || separatorIndex === token.length - 1) {
    return null;
  }

  const encodedPayload = token.slice(0, separatorIndex);
  const providedSignature = token.slice(separatorIndex + 1);
  const expectedSignature = signPayload(encodedPayload, secret);

  if (!timingSafeEqualBase64Url(providedSignature, expectedSignature)) {
    return null;
  }

  const payload = parsePayload(encodedPayload);
  if (!payload) {
    return null;
  }

  const now = options.now ?? Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return null;
  }

  return { slug: payload.slug };
}

/**
 * Build the blog draft preview API path for a signed token.
 */
export function getDraftPreviewApiPath(token: string): string {
  return `/api/blog/draft/${encodeURIComponent(token)}`;
}

/**
 * Constructs a draft preview URL for a blog post.
 * Uses a short-lived HMAC token so the draft secret is never exposed in the URL.
 */
export function getDraftPreviewUrl(
  slug: string,
  draftSecret: string
): string | null {
  const trimmed = slug.trim();
  if (!(trimmed && draftSecret)) {
    return null;
  }

  try {
    const token = createDraftPreviewToken(trimmed, draftSecret);
    const path = getDraftPreviewApiPath(token);
    return new URL(path, getSiteOrigin()).toString();
  } catch {
    return null;
  }
}
