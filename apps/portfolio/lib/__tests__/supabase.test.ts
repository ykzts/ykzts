import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock environment variables first
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

// Mock @supabase/supabase-js
const mockSelect = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn((table: string) => {
  if (table === 'profiles') {
    return {
      limit: mockLimit,
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
      mockSelect.mockReturnValue({
        limit: mockLimit,
        single: mockSingle
      })
    })

    it('should return parsed profile data when valid data is returned', async () => {
      const mockData = {
        email: 'test@example.com',
        name_en: 'Test User',
        name_ja: 'テストユーザー',
        social_links: [
          {
            icon: 'github',
            label: 'GitHub',
            url: 'https://github.com/test'
          }
        ],
        tagline_en: 'Software Developer',
        tagline_ja: 'ソフトウェア開発者',
        technologies: ['JavaScript', 'TypeScript']
      }

      mockLimit.mockReturnValue({
        single: mockSingle
      })
      mockSingle.mockResolvedValue({
        data: mockData,
        error: null
      })

      // Import after mocking
      const { getProfile } = await import('../supabase')
      const result = await getProfile()

      expect(result).toEqual(mockData)
      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockSelect).toHaveBeenCalledWith(
        'name_en, name_ja, tagline_en, tagline_ja, email, social_links, technologies'
      )
      expect(mockLimit).toHaveBeenCalledWith(1)
      expect(mockSingle).toHaveBeenCalled()
    })

    it('should return null when no profile data is found', async () => {
      mockLimit.mockReturnValue({
        single: mockSingle
      })
      mockSingle.mockResolvedValue({
        data: null,
        error: null
      })

      const { getProfile } = await import('../supabase')
      const result = await getProfile()

      expect(result).toBeNull()
    })

    it('should handle Supabase errors gracefully', async () => {
      mockLimit.mockReturnValue({
        single: mockSingle
      })
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      const { getProfile } = await import('../supabase')
      const result = await getProfile()

      expect(result).toBeNull()
    })

    it('should throw validation error when invalid data is returned', async () => {
      const invalidData = {
        email: 'invalid-email', // Invalid email format
        name_en: 'Test User',
        name_ja: 'テストユーザー',
        social_links: [],
        tagline_en: 'Software Developer',
        tagline_ja: 'ソフトウェア開発者',
        technologies: ['JavaScript']
      }

      mockLimit.mockReturnValue({
        single: mockSingle
      })
      mockSingle.mockResolvedValue({
        data: invalidData,
        error: null
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
