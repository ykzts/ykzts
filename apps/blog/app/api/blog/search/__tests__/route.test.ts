import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Supabase client
const mockRpc = vi.fn()
const mockSupabase = {
  rpc: mockRpc
}

vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase
}))

// Mock embedding generation
const mockGenerateSearchEmbedding = vi.fn()
vi.mock('@/lib/embeddings', () => ({
  generateSearchEmbedding: mockGenerateSearchEmbedding
}))

describe('POST /api/blog/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 for invalid JSON body', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: 'invalid json',
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid JSON body')
    expect(mockGenerateSearchEmbedding).not.toHaveBeenCalled()
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('should return 400 for missing query field', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
    expect(data.issues).toBeDefined()
    expect(mockGenerateSearchEmbedding).not.toHaveBeenCalled()
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('should return 400 for empty query', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({ query: '' }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
    expect(data.issues).toBeDefined()
    expect(mockGenerateSearchEmbedding).not.toHaveBeenCalled()
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid limit (too small)', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({ limit: 0, query: 'test query' }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
    expect(data.issues).toBeDefined()
    expect(mockGenerateSearchEmbedding).not.toHaveBeenCalled()
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid limit (too large)', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({ limit: 21, query: 'test query' }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
    expect(data.issues).toBeDefined()
    expect(mockGenerateSearchEmbedding).not.toHaveBeenCalled()
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid threshold (negative)', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({ query: 'test query', threshold: -0.1 }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
    expect(data.issues).toBeDefined()
    expect(mockGenerateSearchEmbedding).not.toHaveBeenCalled()
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid threshold (too large)', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({ query: 'test query', threshold: 1.1 }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
    expect(data.issues).toBeDefined()
    expect(mockGenerateSearchEmbedding).not.toHaveBeenCalled()
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('should successfully search with valid query', async () => {
    const { POST } = await import('../route')

    const mockEmbedding = new Array(1536).fill(0.1)
    const mockResults = [
      {
        excerpt: 'Test excerpt 1',
        id: '123e4567-e89b-12d3-a456-426614174000',
        published_at: '2024-01-01T00:00:00Z',
        similarity: 0.85,
        slug: 'test-post-1',
        tags: ['test', 'blog'],
        title: 'Test Post 1'
      },
      {
        excerpt: 'Test excerpt 2',
        id: '123e4567-e89b-12d3-a456-426614174001',
        published_at: '2024-01-02T00:00:00Z',
        similarity: 0.82,
        slug: 'test-post-2',
        tags: ['test'],
        title: 'Test Post 2'
      }
    ]

    mockGenerateSearchEmbedding.mockResolvedValue(mockEmbedding)
    mockRpc.mockResolvedValue({ data: mockResults, error: null })

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({ query: 'test query' }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.query).toBe('test query')
    expect(data.count).toBe(2)
    expect(data.results).toHaveLength(2)
    expect(data.results[0].title).toBe('Test Post 1')
    expect(data.results[0].similarity).toBe(0.85)

    expect(mockGenerateSearchEmbedding).toHaveBeenCalledWith('test query')
    expect(mockRpc).toHaveBeenCalledWith('search_posts_by_embedding', {
      match_count: 5,
      match_threshold: 0.78,
      query_embedding: JSON.stringify(mockEmbedding)
    })
  })

  it('should use custom limit and threshold', async () => {
    const { POST } = await import('../route')

    const mockEmbedding = new Array(1536).fill(0.1)
    mockGenerateSearchEmbedding.mockResolvedValue(mockEmbedding)
    mockRpc.mockResolvedValue({ data: [], error: null })

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({
        limit: 10,
        query: 'test query',
        threshold: 0.9
      }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.count).toBe(0)
    expect(data.results).toHaveLength(0)

    expect(mockRpc).toHaveBeenCalledWith('search_posts_by_embedding', {
      match_count: 10,
      match_threshold: 0.9,
      query_embedding: JSON.stringify(mockEmbedding)
    })
  })

  it('should return empty results when no matches found', async () => {
    const { POST } = await import('../route')

    const mockEmbedding = new Array(1536).fill(0.1)
    mockGenerateSearchEmbedding.mockResolvedValue(mockEmbedding)
    mockRpc.mockResolvedValue({ data: [], error: null })

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({ query: 'no results query' }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.query).toBe('no results query')
    expect(data.count).toBe(0)
    expect(data.results).toHaveLength(0)
  })

  it('should return 500 when database error occurs', async () => {
    const { POST } = await import('../route')

    const mockEmbedding = new Array(1536).fill(0.1)
    mockGenerateSearchEmbedding.mockResolvedValue(mockEmbedding)
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({ query: 'test query' }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Search failed')
  })

  it('should return 500 when embedding generation fails', async () => {
    const { POST } = await import('../route')

    mockGenerateSearchEmbedding.mockRejectedValue(
      new Error('Embedding generation failed')
    )

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({ query: 'test query' }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Embedding generation failed')
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('should handle null data from database', async () => {
    const { POST } = await import('../route')

    const mockEmbedding = new Array(1536).fill(0.1)
    mockGenerateSearchEmbedding.mockResolvedValue(mockEmbedding)
    mockRpc.mockResolvedValue({ data: null, error: null })

    const request = new NextRequest('http://localhost:3000/api/blog/search', {
      body: JSON.stringify({ query: 'test query' }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.count).toBe(0)
    expect(data.results).toHaveLength(0)
  })
})
