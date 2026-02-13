'use client'

import { useEffect, useState } from 'react'

export default function DraftModeBannerClient() {
  const [isDraftMode, setIsDraftMode] = useState(false)

  useEffect(() => {
    // Check if draft mode is enabled by checking for the draft mode cookie
    const hasDraftModeCookie = document.cookie
      .split('; ')
      .some((cookie) => cookie.startsWith('__prerender_bypass='))
    setIsDraftMode(hasDraftModeCookie)
  }, [])

  if (!isDraftMode) {
    return null
  }

  const handleDisable = async () => {
    await fetch('/api/blog/draft/disable')
    window.location.href = '/blog'
  }

  return (
    <div
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-yellow-500 px-4 py-2 font-medium text-black text-sm shadow-lg"
      role="alert"
    >
      ドラフトモード有効中 - 下書きと予約投稿が表示されます
      <button
        className="ml-4 underline hover:no-underline"
        onClick={handleDisable}
        type="button"
      >
        無効化
      </button>
    </div>
  )
}
