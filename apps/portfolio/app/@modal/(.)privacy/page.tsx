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
      className="m-auto max-h-[80vh] w-full max-w-4xl rounded-xl border border-border bg-card shadow-lg backdrop:bg-black/40"
      onClose={handleClose}
      ref={dialogRef}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-8 py-4">
        <h2 className="font-semibold text-lg text-foreground">
          プライバシーポリシー
        </h2>
        <button
          aria-label="閉じる"
          className="flex size-8 items-center justify-center rounded-md text-2xl text-muted leading-none transition-colors hover:bg-border/50 hover:text-foreground"
          onClick={handleClose}
          type="button"
        >
          ×
        </button>
      </div>
      <div className="overflow-y-auto px-8 py-6">
        <div className="prose prose-base max-w-none prose-p:text-base prose-p:text-muted prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline prose-a:hover:underline prose-strong:text-foreground prose-headings:text-foreground">
          <PrivacyContent />
        </div>
        <div className="mt-8 flex justify-center border-t border-border pt-6">
          <button
            className="rounded-lg bg-accent px-8 py-2.5 text-base font-medium text-accent-foreground transition-colors duration-200 hover:bg-accent/90 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
            onClick={handleClose}
            type="button"
          >
            閉じる
          </button>
        </div>
      </div>
    </dialog>
  )
}
