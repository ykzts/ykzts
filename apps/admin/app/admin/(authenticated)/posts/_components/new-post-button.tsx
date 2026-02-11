'use client'

import { Button } from '@ykzts/ui/components/button'
import Link from 'next/link'

export function NewPostButton() {
  return <Button render={<Link href="/admin/posts/new" />}>新規作成</Button>
}
