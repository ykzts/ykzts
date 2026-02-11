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

  const handleDialogClose = () => {
    router.back()
  }

  const handleClose = () => {
    dialogRef.current?.close()
  }

  return (
    <dialog
      className="m-auto max-h-[80vh] w-full max-w-4xl rounded-xl border border-border bg-card shadow-lg backdrop:bg-black/40"
      onClose={handleDialogClose}
      ref={dialogRef}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-border border-b bg-card px-8 py-4">
        <h2 className="font-semibold text-foreground text-lg">
          プライバシーポリシー
        </h2>
        <button
          aria-label="閉じる"
          className="flex size-8 items-center justify-center rounded-md text-2xl text-muted-foreground leading-none transition-colors hover:bg-border/50 hover:text-foreground"
          onClick={handleClose}
          type="button"
        >
          ×
        </button>
      </div>
      <div className="overflow-y-auto px-8 py-6">
        <div className="prose prose-base max-w-none prose-a:text-primary prose-headings:text-foreground prose-p:text-base prose-p:text-muted-foreground prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
          <PrivacyContent />
        </div>
        <div className="mt-8 flex justify-center border-border border-t pt-6">
          <button
            className="rounded-lg bg-primary px-8 py-2.5 font-medium text-primary-foreground text-base transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
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
