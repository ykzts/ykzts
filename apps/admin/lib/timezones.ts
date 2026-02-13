/**
 * Utility functions for timezone handling
 */

/**
 * Get a list of commonly used timezones grouped by region
 */
export function getCommonTimezones() {
  return [
    // Asia/Pacific
    { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
    { label: 'Asia/Seoul (KST)', value: 'Asia/Seoul' },
    { label: 'Asia/Shanghai (CST)', value: 'Asia/Shanghai' },
    { label: 'Asia/Hong_Kong (HKT)', value: 'Asia/Hong_Kong' },
    { label: 'Asia/Singapore (SGT)', value: 'Asia/Singapore' },
    { label: 'Asia/Bangkok (ICT)', value: 'Asia/Bangkok' },
    { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
    { label: 'Australia/Sydney (AEDT)', value: 'Australia/Sydney' },

    // Europe
    { label: 'Europe/London (GMT)', value: 'Europe/London' },
    { label: 'Europe/Paris (CET)', value: 'Europe/Paris' },
    { label: 'Europe/Berlin (CET)', value: 'Europe/Berlin' },
    { label: 'Europe/Moscow (MSK)', value: 'Europe/Moscow' },

    // Americas
    { label: 'America/New_York (EST)', value: 'America/New_York' },
    { label: 'America/Chicago (CST)', value: 'America/Chicago' },
    { label: 'America/Denver (MST)', value: 'America/Denver' },
    { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
    { label: 'America/Toronto (EST)', value: 'America/Toronto' },
    { label: 'America/Mexico_City (CST)', value: 'America/Mexico_City' },
    { label: 'America/Sao_Paulo (BRT)', value: 'America/Sao_Paulo' },

    // UTC
    { label: 'UTC', value: 'UTC' }
  ]
}

/**
 * Format a date string with timezone support
 * @param dateString - ISO date string from database
 * @param timezone - IANA timezone identifier (e.g., 'Asia/Tokyo')
 * @param options - Intl.DateTimeFormat options
 */
export function formatDateWithTimezone(
  dateString: string,
  timezone: string = 'Asia/Tokyo',
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    const date = new Date(dateString)

    // Default options for consistent formatting
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      timeZoneName: 'short',
      year: 'numeric',
      ...options
    }

    return new Intl.DateTimeFormat('ja-JP', {
      ...defaultOptions,
      timeZone: timezone
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

/**
 * Format a date string to date only (no time)
 * @param dateString - ISO date string from database
 * @param timezone - IANA timezone identifier
 */
export function formatDateOnly(
  dateString: string,
  timezone: string = 'Asia/Tokyo'
): string {
  try {
    const date = new Date(dateString)

    return new Intl.DateTimeFormat('ja-JP', {
      day: 'numeric',
      month: 'short',
      timeZone: timezone,
      year: 'numeric'
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

/**
 * Format a date string to full date and time
 * @param dateString - ISO date string from database
 * @param timezone - IANA timezone identifier
 */
export function formatDateTime(
  dateString: string,
  timezone: string = 'Asia/Tokyo'
): string {
  try {
    const date = new Date(dateString)

    return new Intl.DateTimeFormat('ja-JP', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      second: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}
