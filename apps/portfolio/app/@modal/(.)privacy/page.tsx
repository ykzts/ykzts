'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

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
        <p>
          当サイト（以下「本サイト」）は、サイト訪問者（以下「ユーザー」）の個人情報保護の重要性を認識し、個人情報保護法および関連法規を遵守するとともに、本プライバシーポリシー（以下「本ポリシー」）に従い、適切な取り扱いと保護に努めます。
        </p>

        <h3>1. 収集する情報とその利用目的</h3>

        <p>本サイトで収集する情報は以下の通りです。</p>

        <h4>(1) お問い合わせフォームで収集する情報</h4>

        <p>
          本サイトは、お問い合わせフォームを通じて、以下の個人情報を収集し、記載の目的で利用します。
        </p>

        <table>
          <thead>
            <tr>
              <th>収集する情報</th>
              <th>利用目的</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>氏名、メールアドレス</td>
              <td>
                お問い合わせ内容に関する本人確認、およびご質問・ご要望への回答・ご連絡のため。
              </td>
            </tr>
            <tr>
              <td>件名、メッセージ本文</td>
              <td>お問い合わせ内容を把握し、適切に対応するため。</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4">
          <a
            className="text-brand hover:text-brand-dark"
            href="/privacy"
            onClick={(e) => {
              e.preventDefault()
              handleClose()
              window.location.href = '/privacy'
            }}
          >
            完全なプライバシーポリシーを見る →
          </a>
        </p>
      </div>
    </dialog>
  )
}
