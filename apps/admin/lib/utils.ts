import slugify from 'slugify'

/**
 * Generate a URL-friendly slug from a string
 * Supports Unicode/Japanese text with transliteration
 */
export function generateSlug(text: string): string {
  return slugify(text, {
    locale: 'ja',
    lower: true,
    strict: true,
    trim: true
  })
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
