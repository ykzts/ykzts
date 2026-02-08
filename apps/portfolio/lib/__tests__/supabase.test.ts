import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock environment variables first
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

// Mock @supabase/supabase-js
const mockSelect = vi.fn()
const mockOrder = vi.fn()
const mockFrom = vi.fn(() => ({
  order: mockOrder,
  select: mockSelect
}))

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
