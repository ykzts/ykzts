'use client'

import { Button } from '@ykzts/ui/components/button'
import { Input } from '@ykzts/ui/components/input'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import SearchResults from './search-results'

type SearchResult = {
  excerpt: string | null
  id: string
  published_at: string
  similarity: number
  slug: string
  tags: string[] | null
  title: string
}

type SearchResponse = {
  count: number
  query: string
  results: SearchResult[]
}

export default function SearchForm() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      toast.error('検索キーワードを入力してください')
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch('/api/blog/search', {
        body: JSON.stringify({
          limit: 10,
          query: trimmedQuery
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '検索に失敗しました')
      }

      const data: SearchResponse = await response.json()
      setResults(data.results)

      if (data.results.length === 0) {
        toast.info('該当する記事が見つかりませんでした')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error instanceof Error ? error.message : '検索に失敗しました')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <div className="flex-1">
          <Input
            disabled={isLoading}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードを入力..."
            type="text"
            value={query}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          <Search className="mr-2" />
          {isLoading ? '検索中...' : '検索'}
        </Button>
      </form>

      {hasSearched && results !== null && (
        <SearchResults isLoading={isLoading} results={results} />
      )}
    </div>
  )
}
