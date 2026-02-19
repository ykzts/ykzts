'use client'

import { Button } from '@ykzts/ui/components/button'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type CopyUrlButtonProps = {
  url: string
  label?: string
  showExternalLink?: boolean
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function CopyUrlButton({
  url,
  label,
  showExternalLink = false,
  variant = 'outline',
  size = 'sm'
}: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('URLをコピーしました')

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
      toast.error('URLのコピーに失敗しました')
    }
  }

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (showExternalLink) {
    return (
      <div className="flex gap-1">
        <Button
          aria-label={label ?? 'URLをコピー'}
          onClick={handleCopy}
          size={size}
          title="URLをコピー"
          type="button"
          variant={variant}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {label && <span className="ml-1">{label}</span>}
        </Button>
        <Button
          aria-label="新しいタブで開く"
          onClick={handleOpenInNewTab}
          size={size}
          title="新しいタブで開く"
          type="button"
          variant={variant}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      aria-label={label ?? 'URLをコピー'}
      onClick={handleCopy}
      size={size}
      title="URLをコピー"
      type="button"
      variant={variant}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {label && <span className="ml-1">{label}</span>}
    </Button>
  )
}
