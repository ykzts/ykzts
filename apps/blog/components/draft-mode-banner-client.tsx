'use client'

import { useEffect, useState } from 'react'
import Link from '@/components/link'

export default function DraftModeBannerClient() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-yellow-500 px-4 py-2 font-medium text-black text-sm shadow-lg"
      role="alert"
    >
      ドラフトモード有効中 - 下書きと予約投稿が表示されます
      <Link
        className="ml-4 underline hover:no-underline"
        href="/api/blog/draft/disable"
      >
        無効化
      </Link>
    </div>
  )
}
