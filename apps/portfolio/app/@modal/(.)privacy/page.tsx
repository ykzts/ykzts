'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ykzts/ui/components/dialog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import PrivacyContent from '@/docs/privacy.mdx'

export default function PrivacyModal() {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      router.back()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>プライバシーポリシー</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto -mx-4 px-8">
          <div className="prose prose-base max-w-none prose-a:text-primary prose-headings:text-foreground prose-p:text-base prose-p:text-muted-foreground prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
            <PrivacyContent />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
