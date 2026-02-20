import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLegacyRedirects, legacyRedirects } from './redirects'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('createLegacyRedirects', () => {
  it('maps tuple redirects to permanent redirect objects', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', 'https://example.com')
    const redirects = createLegacyRedirects('https://example.com')

    expect(redirects).toHaveLength(legacyRedirects.length)
    expect(redirects[0]).toEqual({
      destination: 'https://example.com/',
      source: '/([Aa]uthor|about)',
      statusCode: 301
    })
    expect(redirects.at(-1)).toEqual({
      destination: 'https://example.com/blog/:path*',
      source: '/:path*',
      statusCode: 301
    })
  })

  it('normalizes trailing slash in baseUrl', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', 'https://example.com')
    const redirects = createLegacyRedirects('https://example.com/')

    expect(redirects[1]).toEqual({
      destination: 'https://example.com/blog/atom.xml',
      source: '/(feed/?|index.xml|rss)',
      statusCode: 301
    })
  })

  it('supports custom redirect tuples', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', 'https://example.com')
    const redirects = createLegacyRedirects('https://example.com', [
      ['/old', '/new']
    ])

    expect(redirects).toEqual([
      {
        destination: 'https://example.com/new',
        source: '/old',
        statusCode: 301
      }
    ])
  })
})
