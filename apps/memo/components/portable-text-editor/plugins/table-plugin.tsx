'use client'

import { TablePlugin as LexicalTablePlugin } from '@lexical/react/LexicalTablePlugin'

export function TablePlugin() {
  return (
    <LexicalTablePlugin
      hasCellBackgroundColor={false}
      hasCellMerge={false}
      hasHorizontalScroll={true}
    />
  )
}
