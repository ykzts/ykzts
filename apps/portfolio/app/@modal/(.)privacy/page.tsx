'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import PrivacyContent from '../../(docs)/privacy/page.mdx'

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
      className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg border-2 border-brand bg-white p-8 backdrop:bg-black/50"
      onClose={handleClose}
      ref={dialogRef}
    >
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-2xl font-bold">プライバシーポリシー</h2>
        <button
          className="text-2xl leading-none text-gray-500 transition-colors hover:text-gray-700"
          onClick={handleClose}
          type="button"
        >
          ×
        </button>
      </div>
      <div className="prose prose-slate max-w-none">
        <PrivacyContent />
        <p className="mt-4">
          <Link
            className="text-brand hover:text-brand-dark"
            href="/privacy"
            onClick={handleClose}
          >
            完全なページで見る →
          </Link>
        </p>
      </div>
    </dialog>
  )
}
