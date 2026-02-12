'use client'

import { Button } from '@ykzts/ui/components/button'
import { useRouter, useSearchParams } from 'next/navigation'

export function PostsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status') || 'all'

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    params.delete('page') // Reset to page 1 when filtering
    router.push(`/posts?${params.toString()}`)
  }

  const handleClearFilters = () => {
    router.push('/posts')
  }

  const hasFilters = searchParams.has('status')

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
        {hasFilters && (
          <Button onClick={handleClearFilters} size="sm" variant="outline">
            クリア
          </Button>
        )}
      </div>
    </div>
  )
}
