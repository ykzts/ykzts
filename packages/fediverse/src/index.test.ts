import * as dns from 'node:dns/promises'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { extractFediverseHandleFromURL, verifyFediverseHandle } from './index'

vi.mock('node:dns/promises')
global.fetch = vi.fn()

const mockLookup = vi.mocked(dns.lookup)

/** Return a public IP address from the DNS mock */
function mockPublicDns() {
  mockLookup.mockResolvedValue([{ address: '1.1.1.1', family: 4 }] as never)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('verifyFediverseHandle', () => {
  it('returns true when subject matches', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ subject: 'acct:user@mastodon.social' }),
      ok: true
    } as Response)

    expect(
      await verifyFediverseHandle('user@mastodon.social', 'mastodon.social')
    ).toBe(true)
  })

  it('returns true when an alias matches', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({
        aliases: ['acct:user@mastodon.social'],
        subject: 'https://mastodon.social/users/user'
      }),
      ok: true
    } as Response)

    expect(
      await verifyFediverseHandle('user@mastodon.social', 'mastodon.social')
    ).toBe(true)
  })

  it('returns false when neither subject nor aliases match', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({
        aliases: ['acct:other@mastodon.social'],
        subject: 'acct:other@mastodon.social'
      }),
      ok: true
    } as Response)

    expect(
      await verifyFediverseHandle('user@mastodon.social', 'mastodon.social')
    ).toBe(false)
  })

  it('returns false when DNS resolves to a private IP', async () => {
    mockLookup.mockResolvedValue([
      { address: '192.168.1.1', family: 4 }
    ] as never)

    expect(await verifyFediverseHandle('user@internal', 'internal')).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns false when DNS lookup fails', async () => {
    mockLookup.mockRejectedValue(new Error('DNS failure'))

    expect(
      await verifyFediverseHandle('user@mastodon.social', 'mastodon.social')
    ).toBe(false)
  })

  it('returns false when fetch returns non-ok status', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)

    expect(
      await verifyFediverseHandle('user@mastodon.social', 'mastodon.social')
    ).toBe(false)
  })

  it('returns false when WebFinger response fails zod validation', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ notASubject: 123 }),
      ok: true
    } as Response)

    expect(
      await verifyFediverseHandle('user@mastodon.social', 'mastodon.social')
    ).toBe(false)
  })

  it('returns false on fetch error', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Timeout'))

    expect(
      await verifyFediverseHandle('user@mastodon.social', 'mastodon.social')
    ).toBe(false)
  })
})

describe('extractFediverseHandleFromURL', () => {
  it('resolves canonical handle via WebFinger using the full URL as resource', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ subject: 'acct:user@mastodon.social' }),
      ok: true
    } as Response)

    expect(
      await extractFediverseHandleFromURL('https://mastodon.social/@user')
    ).toBe('@user@mastodon.social')
    expect(fetch).toHaveBeenCalledWith(
      'https://mastodon.social/.well-known/webfinger?resource=https%3A%2F%2Fmastodon.social%2F%40user',
      expect.objectContaining({ headers: expect.anything() })
    )
  })

  it('returns the canonical subject even if it differs from the URL path', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ subject: 'acct:canonical@mastodon.social' }),
      ok: true
    } as Response)

    expect(
      await extractFediverseHandleFromURL(
        'https://mastodon.social/@alias/123456'
      )
    ).toBe('@canonical@mastodon.social')
  })

  it('supports URLs without /@username path (e.g. Misskey user page)', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ subject: 'acct:user@misskey.io' }),
      ok: true
    } as Response)

    expect(
      await extractFediverseHandleFromURL('https://misskey.io/users/abcdef')
    ).toBe('@user@misskey.io')
    expect(fetch).toHaveBeenCalledWith(
      'https://misskey.io/.well-known/webfinger?resource=https%3A%2F%2Fmisskey.io%2Fusers%2Fabcdef',
      expect.objectContaining({ headers: expect.anything() })
    )
  })

  it('returns null for HTTP URLs', async () => {
    expect(
      await extractFediverseHandleFromURL('http://mastodon.social/@user')
    ).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns null for an invalid URL', async () => {
    expect(await extractFediverseHandleFromURL('not-a-url')).toBeNull()
  })

  it('returns null for an empty string', async () => {
    expect(await extractFediverseHandleFromURL('')).toBeNull()
  })

  it('returns null when DNS resolves to a private IP (192.168.x.x)', async () => {
    mockLookup.mockResolvedValue([
      { address: '192.168.1.1', family: 4 }
    ] as never)

    expect(
      await extractFediverseHandleFromURL('https://internal.example/@user')
    ).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns null when DNS resolves to a private IP (10.x.x.x)', async () => {
    mockLookup.mockResolvedValue([{ address: '10.0.0.1', family: 4 }] as never)

    expect(
      await extractFediverseHandleFromURL('https://internal.example/@user')
    ).toBeNull()
  })

  it('returns null when DNS resolves to a private IP (172.16-31.x.x)', async () => {
    mockLookup.mockResolvedValue([
      { address: '172.16.0.1', family: 4 }
    ] as never)

    expect(
      await extractFediverseHandleFromURL('https://internal.example/@user')
    ).toBeNull()
  })

  it('returns null when DNS resolves to loopback (127.x.x.x)', async () => {
    mockLookup.mockResolvedValue([{ address: '127.0.0.1', family: 4 }] as never)

    expect(
      await extractFediverseHandleFromURL('https://local.example/@user')
    ).toBeNull()
  })

  it('returns null when DNS resolves to link-local (169.254.x.x)', async () => {
    mockLookup.mockResolvedValue([
      { address: '169.254.1.1', family: 4 }
    ] as never)

    expect(
      await extractFediverseHandleFromURL('https://local.example/@user')
    ).toBeNull()
  })

  it('returns null when DNS resolves to CGNAT (100.64.x.x)', async () => {
    mockLookup.mockResolvedValue([
      { address: '100.64.0.1', family: 4 }
    ] as never)

    expect(
      await extractFediverseHandleFromURL('https://cgnat.example/@user')
    ).toBeNull()
  })

  it('returns null when DNS resolves to IPv4-mapped IPv6 with private address', async () => {
    mockLookup.mockResolvedValue([
      { address: '::ffff:192.168.1.1', family: 6 }
    ] as never)

    expect(
      await extractFediverseHandleFromURL('https://internal.example/@user')
    ).toBeNull()
  })

  it('returns null when WebFinger returns non-acct subject', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ subject: 'https://mastodon.social/users/user' }),
      ok: true
    } as Response)

    expect(
      await extractFediverseHandleFromURL('https://mastodon.social/@user')
    ).toBeNull()
  })

  it('returns null when WebFinger response fails validation', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ notASubject: 123 }),
      ok: true
    } as Response)

    expect(
      await extractFediverseHandleFromURL('https://mastodon.social/@user')
    ).toBeNull()
  })

  it('returns null when fetch fails', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Timeout'))

    expect(
      await extractFediverseHandleFromURL('https://mastodon.social/@user')
    ).toBeNull()
  })

  it('returns null when fetch returns non-ok status', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)

    expect(
      await extractFediverseHandleFromURL('https://mastodon.social/@user')
    ).toBeNull()
  })

  it('returns null when fetch returns a redirect (3xx)', async () => {
    mockPublicDns()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 301
    } as Response)

    expect(
      await extractFediverseHandleFromURL('https://mastodon.social/@user')
    ).toBeNull()
    expect(fetch).toHaveBeenCalledOnce()
  })
})
