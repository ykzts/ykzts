import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock environment variables first
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

// Mock @supabase/supabase-js
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom
  }))
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  cacheTag: vi.fn()
}))

describe('Supabase utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should return parsed profile data when valid data is returned', async () => {
      const mockData = {
        about: [
          {
            _type: 'block',
            children: [{ _type: 'span', text: 'About text' }]
          }
        ],
        email: 'test@example.com',
        id: 'test-id',
        name: 'Test User',
        social_links: [
          {
            url: 'https://github.com/test'
          }
        ],
        tagline: 'Software Developer',
        technologies: [{ name: 'JavaScript' }, { name: 'TypeScript' }]
      }

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({
              data: mockData,
              error: null
            })
          )
        }))
      })

      const { getProfile } = await import('../supabase')
      const result = await getProfile()

      expect(result).toEqual(mockData)
      expect(mockFrom).toHaveBeenCalledWith('profiles')
    })

    it('should throw error when no profile data is found', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: null
            })
          )
        }))
      })

      const { getProfile } = await import('../supabase')
      await expect(getProfile()).rejects.toThrow('Profile not found')
    })

    it('should throw error on Supabase errors', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Database error' }
            })
          )
        }))
      })

      const { getProfile } = await import('../supabase')
      await expect(getProfile()).rejects.toThrow(
        'Failed to fetch profile: Database error'
      )
    })
  })

  describe('getWorks', () => {
    it('should return works data when valid data is returned', async () => {
      const mockData = [
        {
          content: [{ _type: 'block', children: [{ text: 'Test content' }] }],
          slug: 'test-work',
          starts_at: '2024-01-01',
          title: 'Test Work'
        }
      ]

      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: mockData,
              error: null
            })
          )
        }))
      })

      const { getWorks } = await import('../supabase')
      const result = await getWorks()

      expect(result).toEqual(mockData)
      expect(mockFrom).toHaveBeenCalledWith('works')
    })

    it('should throw error when Supabase returns error', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Database error' }
            })
          )
        }))
      })

      const { getWorks } = await import('../supabase')
      await expect(getWorks()).rejects.toThrow(
        'Failed to fetch works: Database error'
      )
    })
  })
})
