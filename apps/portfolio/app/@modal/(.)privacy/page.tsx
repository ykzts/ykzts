'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import PrivacyContent from '../../../docs/privacy.mdx'

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
      className="m-auto max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg border-2 border-brand bg-white p-8 backdrop:bg-black/50"
      onClose={handleClose}
      ref={dialogRef}
    >
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-2xl font-bold">プライバシーポリシー</h2>
        <button
          aria-label="閉じる"
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
          <button
            className="text-gray-900 underline hover:text-gray-700"
            onClick={handleClose}
            type="button"
          >
            閉じる
          </button>
          {' '}または{' '}
          <Link
            className="text-gray-900 underline hover:text-gray-700"
            href="/privacy"
          >
            完全なページで見る →
          </Link>
        </p>
      </div>
    </dialog>
  )
}
