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
import { Field, FieldDescription, FieldLabel } from '@ykzts/ui/components/field'
import { Input } from '@ykzts/ui/components/input'
import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { validateUrl } from './link-plugin'

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (url: string, title: string) => void
}

export function LinkDialog({ open, onOpenChange, onConfirm }: LinkDialogProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setUrl('')
      setTitle('')
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

    onConfirm(url, title)
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
            <DialogDescription>
              リンクのURLとtitle属性を入力してください
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="link-url-input">URL</FieldLabel>
              <Input
                aria-describedby={error ? 'link-url-error' : undefined}
                aria-invalid={!!error}
                id="link-url-input"
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
                <FieldDescription
                  className="text-destructive"
                  id="link-url-error"
                  role="alert"
                >
                  {error}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="link-title-input">
                title属性（任意）
              </FieldLabel>
              <Input
                aria-describedby="link-title-description"
                id="link-title-input"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="リンクのタイトル"
                type="text"
                value={title}
              />
              <FieldDescription id="link-title-description">
                ツールチップやスクリーンリーダーで使用されます
              </FieldDescription>
            </Field>
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
