'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import PrivacyContent from '@/docs/privacy.mdx'

export default function PrivacyModal() {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const handleClose = () => {
    dialogRef.current?.close()
    router.back()
  }

  return (
    <dialog
      className="m-auto max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-border bg-card p-8 shadow-lg backdrop:bg-black/40"
      onClose={handleClose}
      ref={dialogRef}
    >
      <div className="mb-4 flex items-end justify-end">
        <button
          aria-label="閉じる"
          className="text-2xl text-muted leading-none transition-colors hover:text-foreground"
          onClick={handleClose}
          type="button"
        >
          ×
        </button>
      </div>
      <div className="prose prose-base max-w-none prose-p:text-base prose-p:text-muted prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-headings:text-foreground">
        <PrivacyContent />
      </div>
    </dialog>
  )
}
