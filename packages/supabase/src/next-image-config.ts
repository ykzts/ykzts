/**
 * Supabase Storage Image Configuration for Next.js
 *
 * This module provides a utility function to generate Next.js image configuration
 * for Supabase Storage based on the NEXT_PUBLIC_SUPABASE_URL environment variable.
 *
 * @example
 * ```ts
 * import { getSupabaseImageConfig } from '@ykzts/supabase/next-image-config'
 *
 * const nextConfig = {
 *   images: getSupabaseImageConfig()
 * }
 * ```
 */

import type { NextConfig } from 'next'

/**
 * Generate Next.js image configuration for Supabase Storage
 *
 * @param supabaseUrl - The Supabase project URL (defaults to NEXT_PUBLIC_SUPABASE_URL)
 * @returns Next.js images configuration object
 *
 * @remarks
 * - Automatically detects localhost and enables `dangerouslyAllowLocalIP` in development
 * - Configures remote patterns for Supabase Storage public bucket
 * - Safe for production use (no localhost allowance unless explicitly localhost)
 */
export function getSupabaseImageConfig(
  supabaseUrl?: string
): NextConfig['images'] {
  const url = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const imageConfig: NextConfig['images'] = {}

  if (!url) {
    return imageConfig
  }

  try {
    const parsedUrl = new URL(url)
    const isLocalhost =
      parsedUrl.hostname === 'localhost' ||
      parsedUrl.hostname === '127.0.0.1' ||
      parsedUrl.hostname === '0.0.0.0' ||
      parsedUrl.hostname.endsWith('.local')

    // Allow localhost IPs only in development
    if (isLocalhost && process.env.NODE_ENV !== 'production') {
      imageConfig.dangerouslyAllowLocalIP = true

      // Add patterns for all common localhost variants and the actual hostname if .local
      const localhostVariants = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        ...(parsedUrl.hostname.endsWith('.local') ? [parsedUrl.hostname] : [])
      ]
      imageConfig.remotePatterns = localhostVariants.map((hostname) => ({
        hostname,
        pathname: '/storage/v1/object/public/**',
        port: parsedUrl.port || undefined,
        protocol: parsedUrl.protocol.replace(':', '') as 'http' | 'https'
      }))
    } else {
      imageConfig.remotePatterns = [
        {
          hostname: parsedUrl.hostname,
          pathname: '/storage/v1/object/public/**',
          port: parsedUrl.port || undefined,
          protocol: parsedUrl.protocol.replace(':', '') as 'http' | 'https'
        }
      ]
    }
  } catch (error) {
    console.warn('Failed to parse Supabase URL for image config:', error)
  }

  return imageConfig
}
