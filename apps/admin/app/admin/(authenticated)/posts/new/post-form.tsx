'use client'
import { Button } from '@ykzts/ui/button'
import { Input } from '@ykzts/ui/input'

import { useActionState } from 'react'
import type { ActionState } from './actions'
import { createPost } from './actions'

export function PostForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createPost,
    null
  )

  return (
    <div>
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="rounded bg-error/10 p-4 text-error">
            {state.error}
          </div>
        )}

        <div>
          <label className="mb-2 block font-medium" htmlFor="title">
            タイトル
          </label>
          <Input
            id="title"
            maxLength={256}
            name="title"
            placeholder="タイトルを入力（任意）"
            type="text"
          />
          <p className="mt-1 text-muted-foreground text-sm">
            任意、256文字以内
          </p>
        </div>

        <div className="flex justify-end">
          <Button disabled={isPending} type="submit">
            {isPending ? '作成中...' : '作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}
