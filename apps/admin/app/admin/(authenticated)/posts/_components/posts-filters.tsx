'use client'

import { Button } from '@ykzts/ui/components/button'
import { Input } from '@ykzts/ui/components/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function PostsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const currentStatus = searchParams.get('status') || 'all'

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    params.delete('page') // Reset to page 1 when filtering
    router.push(`/admin/posts?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to page 1 when searching
    router.push(`/admin/posts?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearch('')
    router.push('/admin/posts')
  }

  const hasFilters = searchParams.has('search') || searchParams.has('status')

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => handleStatusFilter('all')}
          size="sm"
          variant={currentStatus === 'all' ? 'default' : 'outline'}
        >
          すべて
        </Button>
        <Button
          onClick={() => handleStatusFilter('draft')}
          size="sm"
          variant={currentStatus === 'draft' ? 'default' : 'outline'}
        >
          下書き
        </Button>
        <Button
          onClick={() => handleStatusFilter('scheduled')}
          size="sm"
          variant={currentStatus === 'scheduled' ? 'default' : 'outline'}
        >
          予約
        </Button>
        <Button
          onClick={() => handleStatusFilter('published')}
          size="sm"
          variant={currentStatus === 'published' ? 'default' : 'outline'}
        >
          公開
        </Button>
      </div>

      <form className="flex gap-2" onSubmit={handleSearch}>
        <Input
          onChange={(e) => setSearch(e.target.value)}
          placeholder="タイトルや抜粋で検索..."
          type="text"
          value={search}
        />
        <Button type="submit">検索</Button>
        {hasFilters && (
          <Button onClick={handleClearFilters} type="button" variant="outline">
            クリア
          </Button>
        )}
      </form>
    </div>
  )
}
