'use client'

import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin'

export function validateUrl(url: string): boolean {
  if (!URL.canParse(url)) return false
  const { protocol } = new URL(url)
  return protocol === 'http:' || protocol === 'https:'
}

export function LinkPlugin() {
  return <LexicalLinkPlugin validateUrl={validateUrl} />
}
