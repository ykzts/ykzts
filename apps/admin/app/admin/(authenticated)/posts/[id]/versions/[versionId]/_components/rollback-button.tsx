'use client'

import { Button } from '@ykzts/ui/components/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { rollbackAction } from './actions'

type RollbackButtonProps = {
  postId: string
  versionId: string
  versionNumber: number
}

export function RollbackButton({
  postId,
  versionId,
  versionNumber
}: RollbackButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRollback = async () => {
    if (
      !confirm(
        `バージョン ${versionNumber} にロールバックしますか？\n\n新しいバージョンとして保存されます（履歴は保持されます）。`
      )
    ) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await rollbackAction(postId, versionId)
      router.push(`/admin/posts/${postId}/versions`)
      router.refresh()
    } catch (err) {
      setIsLoading(false)
      setError(
        err instanceof Error ? err.message : 'ロールバックに失敗しました'
      )
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-2 text-error text-sm">{error}</div>
      )}
      <Button
        disabled={isLoading}
        onClick={handleRollback}
        size="sm"
        variant="outline"
      >
        {isLoading ? 'ロールバック中...' : 'このバージョンにロールバック'}
      </Button>
    </div>
  )
}
