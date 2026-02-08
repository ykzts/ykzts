import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock environment variables first
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

// Mock @supabase/supabase-js
const mockSelect = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const _mockSingle = vi.fn()
const mockEq = vi.fn()
const mockFrom = vi.fn((table: string) => {
  if (table === 'profiles') {
    return {
      limit: mockLimit,
      select: mockSelect
    }
  }
  if (table === 'social_links' || table === 'technologies') {
    return {
      eq: mockEq,
      select: mockSelect
    }
  }
  return {
    order: mockOrder,
    select: mockSelect
  }
})

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
    mockSelect.mockReturnValue({
      order: mockOrder
    })
  })

  describe('getProfile', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return parsed profile data when valid data is returned', async () => {
      const mockProfileData = {
        about: 'About text',
        email: 'test@example.com',
        name: 'Test User',
        tagline: 'Software Developer'
      }

      const mockSocialLinksData = [
        {
          icon: 'github',
          label: 'GitHub',
          url: 'https://github.com/test'
        }
      ]

      const mockTechnologiesData = [
        { name: 'JavaScript' },
        { name: 'TypeScript' }
      ]

      // Mock profiles table
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: mockProfileData,
                    error: null
                  })
                )
              }))
            }))
          }
        }
        if (table === 'social_links') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() =>
                  Promise.resolve({
                    data: mockSocialLinksData,
                    error: null
                  })
                )
              }))
            }))
          }
        }
        if (table === 'technologies') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() =>
                  Promise.resolve({
                    data: mockTechnologiesData,
                    error: null
                  })
                )
              }))
            }))
          }
        }
        return {
          order: mockOrder,
          select: mockSelect
        }
      })

      // Import after mocking
      const { getProfile } = await import('../supabase')
      const result = await getProfile()

      expect(result).toEqual({
        ...mockProfileData,
        social_links: mockSocialLinksData,
        technologies: ['JavaScript', 'TypeScript']
      })
      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockFrom).toHaveBeenCalledWith('social_links')
      expect(mockFrom).toHaveBeenCalledWith('technologies')
    })

    it('should return null when no profile data is found', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: null,
                    error: null
                  })
                )
              }))
            }))
          }
        }
        return {
          order: mockOrder,
          select: mockSelect
        }
      })

      const { getProfile } = await import('../supabase')
      const result = await getProfile()

      expect(result).toBeNull()
    })

    it('should handle Supabase errors gracefully', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: null,
                    error: { message: 'Database error' }
                  })
                )
              }))
            }))
          }
        }
        return {
          order: mockOrder,
          select: mockSelect
        }
      })

      const { getProfile } = await import('../supabase')
      const result = await getProfile()

      expect(result).toBeNull()
    })

    it('should throw validation error when invalid data is returned', async () => {
      const invalidData = {
        about: 'About text',
        email: 'invalid-email',
        name: 'Test User',
        tagline: 'Software Developer'
      }

      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: invalidData,
                    error: null
                  })
                )
              }))
            }))
          }
        }
        if (table === 'social_links') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() =>
                  Promise.resolve({
                    data: [],
                    error: null
                  })
                )
              }))
            }))
          }
        }
        if (table === 'technologies') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() =>
                  Promise.resolve({
                    data: [],
                    error: null
                  })
                )
              }))
            }))
          }
        }
        return {
          order: mockOrder,
          select: mockSelect
        }
      })

      const { getProfile } = await import('../supabase')
      await expect(getProfile()).rejects.toThrow()
    })
  })

  describe('getWorks', () => {
    it('should return parsed works data when valid data is returned', async () => {
      const mockData = [
        {
          content: [{ _type: 'block', children: [{ text: 'Test content' }] }],
          slug: 'test-work',
          starts_at: '2024-01-01',
          title: 'Test Work'
        }
      ]

      mockOrder.mockResolvedValue({
        data: mockData,
        error: null
      })

      // Import after mocking
      const { getWorks } = await import('../supabase')
      const result = await getWorks()

      expect(result).toEqual(mockData)
      expect(mockFrom).toHaveBeenCalledWith('works')
      expect(mockSelect).toHaveBeenCalledWith('content, slug, title, starts_at')
      expect(mockOrder).toHaveBeenCalledWith('starts_at', { ascending: false })
    })

    it('should throw an error when invalid data is returned', async () => {
      const invalidData = [
        {
          content: [{ _type: 'block', children: [{ text: 'Test content' }] }],
          slug: 'test-work'
          // Missing required title field
        }
      ]

      mockOrder.mockResolvedValue({
        data: invalidData,
        error: null
      })

      const { getWorks } = await import('../supabase')
      await expect(getWorks()).rejects.toThrow()
    })

    it('should handle empty array response', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      })

      const { getWorks } = await import('../supabase')
      const result = await getWorks()

      expect(result).toEqual([])
    })

    it('should handle Supabase errors gracefully', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      const { getWorks } = await import('../supabase')
      const result = await getWorks()

      expect(result).toEqual([])
    })
  })
})
