'use client'

import { Button } from '@ykzts/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@ykzts/ui/components/dialog'
import { Input } from '@ykzts/ui/components/input'
import { Label } from '@ykzts/ui/components/label'
import type { FormEvent } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { validateUrl } from './link-plugin'

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (url: string) => void
}

export function LinkDialog({ open, onOpenChange, onConfirm }: LinkDialogProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const errorId = useId()

  useEffect(() => {
    if (open) {
      setUrl('')
      setError('')
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError('URLを入力してください')
      return
    }

    if (!validateUrl(url)) {
      setError('有効なURL（http://またはhttps://）を入力してください')
      return
    }

    onConfirm(url)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent showCloseButton={false}>
        <form noValidate onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>リンクを挿入</DialogTitle>
            <DialogDescription>リンクのURLを入力してください</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor={inputId}>URL</Label>
            <Input
              aria-describedby={error ? errorId : undefined}
              aria-invalid={!!error}
              id={inputId}
              onChange={(e) => {
                setUrl(e.target.value)
                setError('')
              }}
              placeholder="https://example.com"
              ref={inputRef}
              type="url"
              value={url}
            />
            {error && (
              <p
                className="mt-1 text-destructive text-sm"
                id={errorId}
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleCancel} type="button" variant="outline">
              キャンセル
            </Button>
            <Button type="submit">挿入</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
