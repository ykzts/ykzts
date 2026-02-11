'use client'

import { Button } from '@ykzts/ui/components/button'
import Link from 'next/link'

export function NewWorkButton() {
  return <Button render={<Link href="/admin/works/new" />}>新規作成</Button>
}
