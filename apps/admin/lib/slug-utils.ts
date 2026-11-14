/**
 * Clean and normalize a slug to ensure it's valid
 * @param rawSlug - Raw slug text from AI or other source
 * @returns Cleaned slug with only lowercase letters, numbers, and hyphens
 */
export function cleanSlug(rawSlug: string): string {
  return rawSlug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/gu, "-") // Replace invalid chars with hyphens
    .replace(/-+/gu, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/gu, ""); // Remove leading/trailing hyphens
}
