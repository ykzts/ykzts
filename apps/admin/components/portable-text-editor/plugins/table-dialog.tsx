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
import { Field, FieldLabel } from '@ykzts/ui/components/field'
import { Input } from '@ykzts/ui/components/input'
import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

interface TableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (rows: number, columns: number) => void
}

export function TableDialog({
  open,
  onOpenChange,
  onConfirm
}: TableDialogProps) {
  const [rows, setRows] = useState('3')
  const [columns, setColumns] = useState('3')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setRows('3')
      setColumns('3')
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const rowCount = Number.parseInt(rows, 10)
    const colCount = Number.parseInt(columns, 10)

    if (
      !Number.isFinite(rowCount) ||
      rowCount < 1 ||
      !Number.isFinite(colCount) ||
      colCount < 1
    ) {
      return
    }

    onConfirm(rowCount, colCount)
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
            <DialogTitle>テーブルを挿入</DialogTitle>
            <DialogDescription>
              テーブルの行数と列数を入力してください
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="table-rows-input">行数</FieldLabel>
              <Input
                id="table-rows-input"
                min={1}
                onChange={(e) => setRows(e.target.value)}
                ref={inputRef}
                type="number"
                value={rows}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="table-columns-input">列数</FieldLabel>
              <Input
                id="table-columns-input"
                min={1}
                onChange={(e) => setColumns(e.target.value)}
                type="number"
                value={columns}
              />
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
