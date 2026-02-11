'use client'

import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin'

export function validateUrl(url: string): boolean {
  return URL.canParse(url)
}

export function LinkPlugin() {
  return <LexicalLinkPlugin validateUrl={validateUrl} />
}
