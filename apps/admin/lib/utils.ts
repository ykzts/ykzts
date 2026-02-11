/**
 * Generate a URL-friendly slug from a string
 * Converts to lowercase, removes special characters, and replaces spaces with hyphens
 * For Japanese text, this will create empty slugs - users should manually edit slugs for Japanese titles
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate text to a specified length and add ellipsis if needed
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

/**
 * Format a date for display in Japanese locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ja-JP', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Format a datetime for display in Japanese locale
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ja-JP', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
