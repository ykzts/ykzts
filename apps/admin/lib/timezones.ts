/**
 * Utility functions for timezone handling
 */

/**
 * Default timezone for the application
 */
export const DEFAULT_TIMEZONE = 'Asia/Tokyo'

/**
 * Get a list of commonly used timezones grouped by region
 */
export function getCommonTimezones() {
  return [
    // Asia/Pacific
    { label: 'Asia/Tokyo (Japan)', value: 'Asia/Tokyo' },
    { label: 'Asia/Seoul (Korea)', value: 'Asia/Seoul' },
    { label: 'Asia/Shanghai (China)', value: 'Asia/Shanghai' },
    { label: 'Asia/Hong_Kong (Hong Kong)', value: 'Asia/Hong_Kong' },
    { label: 'Asia/Singapore (Singapore)', value: 'Asia/Singapore' },
    { label: 'Asia/Bangkok (Thailand)', value: 'Asia/Bangkok' },
    { label: 'Asia/Dubai (UAE)', value: 'Asia/Dubai' },
    { label: 'Asia/Kolkata (India)', value: 'Asia/Kolkata' },
    { label: 'Asia/Jakarta (Indonesia)', value: 'Asia/Jakarta' },
    { label: 'Asia/Manila (Philippines)', value: 'Asia/Manila' },
    { label: 'Asia/Taipei (Taiwan)', value: 'Asia/Taipei' },
    { label: 'Australia/Sydney (Australia)', value: 'Australia/Sydney' },
    { label: 'Pacific/Auckland (New Zealand)', value: 'Pacific/Auckland' },

    // Europe
    { label: 'Europe/London (UK)', value: 'Europe/London' },
    { label: 'Europe/Paris (France)', value: 'Europe/Paris' },
    { label: 'Europe/Berlin (Germany)', value: 'Europe/Berlin' },
    { label: 'Europe/Moscow (Russia)', value: 'Europe/Moscow' },
    { label: 'Europe/Istanbul (Turkey)', value: 'Europe/Istanbul' },
    { label: 'Europe/Amsterdam (Netherlands)', value: 'Europe/Amsterdam' },

    // Americas
    { label: 'America/New_York (US Eastern)', value: 'America/New_York' },
    { label: 'America/Chicago (US Central)', value: 'America/Chicago' },
    { label: 'America/Denver (US Mountain)', value: 'America/Denver' },
    { label: 'America/Los_Angeles (US Pacific)', value: 'America/Los_Angeles' },
    { label: 'America/Toronto (Canada Eastern)', value: 'America/Toronto' },
    { label: 'America/Mexico_City (Mexico)', value: 'America/Mexico_City' },
    { label: 'America/Sao_Paulo (Brazil)', value: 'America/Sao_Paulo' },
    {
      label: 'America/Buenos_Aires (Argentina)',
      value: 'America/Buenos_Aires'
    },

    // Africa
    { label: 'Africa/Cairo (Egypt)', value: 'Africa/Cairo' },
    {
      label: 'Africa/Johannesburg (South Africa)',
      value: 'Africa/Johannesburg'
    },
    { label: 'Africa/Lagos (Nigeria)', value: 'Africa/Lagos' },

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
  timezone: string = DEFAULT_TIMEZONE,
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    const date = new Date(dateString)

    // Default options for consistent formatting
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'numeric',
      timeZoneName: 'short',
      year: 'numeric',
      ...options
    }

    return new Intl.DateTimeFormat('ja-JP', {
      ...defaultOptions,
      timeZone: timezone
    }).format(date)
  } catch (error) {
    console.error(
      `Error formatting date in formatDateWithTimezone: dateString=${dateString}, timezone=${timezone}`,
      error
    )
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
  timezone: string = DEFAULT_TIMEZONE
): string {
  try {
    const date = new Date(dateString)

    return new Intl.DateTimeFormat('ja-JP', {
      day: 'numeric',
      month: 'numeric',
      timeZone: timezone,
      year: 'numeric'
    }).format(date)
  } catch (error) {
    console.error(
      `Error formatting date in formatDateOnly: dateString=${dateString}, timezone=${timezone}`,
      error
    )
    return dateString
  }
}

/**
 * Format a date string to full date and time with timezone
 * @param dateString - ISO date string from database
 * @param timezone - IANA timezone identifier
 */
export function formatDateTimeWithTimezone(
  dateString: string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  try {
    const date = new Date(dateString)

    return new Intl.DateTimeFormat('ja-JP', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'numeric',
      second: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    console.error(
      `Error formatting date in formatDateTimeWithTimezone: dateString=${dateString}, timezone=${timezone}`,
      error
    )
    return dateString
  }
}
