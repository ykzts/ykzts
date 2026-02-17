'use client'

import { Button } from '@ykzts/ui/components/button'
import { Input } from '@ykzts/ui/components/input'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type SearchFormProps = {
  className?: string
  defaultQuery?: string
}

export default function SearchForm({
  className,
  defaultQuery = ''
}: SearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return
    }

    // Navigate to search page with query param
    const params = new URLSearchParams({ q: trimmedQuery })
    router.push(`/blog/search?${params.toString()}`)
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <Input
          aria-label="検索"
          className="flex-1"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キーワードを入力..."
          type="search"
          value={query}
        />
        <Button type="submit">
          <Search className="mr-2" />
          検索
        </Button>
      </div>
    </form>
  )
}
