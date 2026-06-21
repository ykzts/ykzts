import { timingSafeEqual } from "node:crypto";

/**
 * Compare two strings in constant time to mitigate timing attacks.
 * Returns false when lengths differ (after a dummy comparison).
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    timingSafeEqual(bufferA, bufferA);
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

/**
 * Verify a shared secret value (header, query param replacement, etc.).
 */
export function verifySecret(
  provided: string | null | undefined,
  expected: string | undefined
): boolean {
  if (!(provided && expected)) {
    return false;
  }

  return timingSafeEqualStrings(provided, expected);
}

/**
 * Verify an Authorization: Bearer <secret> header.
 */
export function verifyBearerSecret(
  authorizationHeader: string | null | undefined,
  expectedSecret: string | undefined
): boolean {
  if (!expectedSecret) {
    return false;
  }

  const prefix = "Bearer ";
  if (!authorizationHeader?.startsWith(prefix)) {
    return false;
  }

  const provided = authorizationHeader.slice(prefix.length);
  return timingSafeEqualStrings(provided, expectedSecret);
}
