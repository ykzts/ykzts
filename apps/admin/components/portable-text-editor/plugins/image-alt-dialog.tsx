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

interface ImageAltDialogProps {
  initialAlt?: string
  open: boolean
  onConfirm: (alt: string) => void
  onOpenChange: (open: boolean) => void
}

export function ImageAltDialog({
  initialAlt = '',
  open,
  onConfirm,
  onOpenChange
}: ImageAltDialogProps) {
  const [alt, setAlt] = useState(initialAlt)
  const [warning, setWarning] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let rafId: number
    if (open) {
      setAlt(initialAlt)
      setWarning('')
      rafId = requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [open, initialAlt])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!alt.trim()) {
      if (!warning) {
        // First submission with empty alt: show warning and keep dialog open
        setWarning(
          'alt属性が空です。アクセシビリティのため、画像の内容を説明するテキストを入力することを推奨します。'
        )
        return
      }
      // Warning already visible — user acknowledged it; proceed
    }

    setWarning('')
    onConfirm(alt)
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
            <DialogTitle>画像のalt属性</DialogTitle>
            <DialogDescription>
              画像の代替テキスト（alt属性）を入力してください
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Field>
              <FieldLabel htmlFor="image-alt-input">
                代替テキスト（alt）
              </FieldLabel>
              <Input
                id="image-alt-input"
                onChange={(e) => {
                  setAlt(e.target.value)
                  setWarning('')
                }}
                placeholder="画像の内容を説明するテキスト"
                ref={inputRef}
                type="text"
                value={alt}
              />
              {warning && (
                <FieldDescription className="text-yellow-600" role="alert">
                  {warning}
                </FieldDescription>
              )}
            </Field>
          </div>

          <DialogFooter>
            <Button onClick={handleCancel} type="button" variant="outline">
              キャンセル
            </Button>
            <Button type="submit">確定</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
