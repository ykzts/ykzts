'use client'

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import type { EditorState, LexicalEditor } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageNode } from './nodes/image-node'
import { CodeExitPlugin } from './plugins/code-exit-plugin'
import { CodeHighlightPlugin } from './plugins/code-highlight-plugin'
import { EditorStatePlugin } from './plugins/editor-state-plugin'
import { ImagePlugin } from './plugins/image-plugin'
import { LinkPlugin } from './plugins/link-plugin'
import { TablePlugin } from './plugins/table-plugin'
import { ToolbarPlugin } from './plugins/toolbar-plugin'
import {
  initializeEditorWithPortableText,
  lexicalToPortableText
} from './portable-text-serializer'

// Minimal theme - @tailwindcss/typography handles most styling
const editorTheme = {
  code: 'block overflow-x-auto whitespace-pre font-mono text-sm not-prose bg-muted/20 border border-border rounded p-4 my-2',
  codeHighlight: {
    atrule: 'text-purple-600 dark:text-purple-400',
    attr: 'text-blue-600 dark:text-blue-400',
    boolean: 'text-orange-600 dark:text-orange-400',
    builtin: 'text-cyan-600 dark:text-cyan-400',
    cdata: 'text-gray-600 dark:text-gray-400',
    char: 'text-green-600 dark:text-green-400',
    class: 'text-yellow-600 dark:text-yellow-400',
    'class-name': 'text-yellow-600 dark:text-yellow-400',
    comment: 'text-gray-500 dark:text-gray-400 italic',
    constant: 'text-orange-600 dark:text-orange-400',
    deleted: 'text-red-600 dark:text-red-400',
    doctype: 'text-gray-600 dark:text-gray-400',
    entity: 'text-orange-600 dark:text-orange-400',
    function: 'text-blue-600 dark:text-blue-400',
    important: 'text-red-600 dark:text-red-400 font-bold',
    inserted: 'text-green-600 dark:text-green-400',
    keyword: 'text-purple-600 dark:text-purple-400',
    namespace: 'text-cyan-600 dark:text-cyan-400',
    number: 'text-orange-600 dark:text-orange-400',
    operator: 'text-gray-700 dark:text-gray-300',
    prolog: 'text-gray-600 dark:text-gray-400',
    property: 'text-blue-600 dark:text-blue-400',
    punctuation: 'text-gray-700 dark:text-gray-300',
    regex: 'text-green-600 dark:text-green-400',
    selector: 'text-green-600 dark:text-green-400',
    string: 'text-green-600 dark:text-green-400',
    symbol: 'text-orange-600 dark:text-orange-400',
    tag: 'text-red-600 dark:text-red-400',
    url: 'text-blue-600 dark:text-blue-400',
    variable: 'text-orange-600 dark:text-orange-400'
  }
}

type RichTextEditorProps = {
  autoFocus?: boolean
  id?: string
  initialValue?: string
  name: string
  onChange?: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({
  autoFocus = false,
  id,
  initialValue,
  name,
  onChange,
  placeholder
}: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false)
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const initialConfig = {
    editorState: initialValue
      ? (editor: LexicalEditor) => {
          initializeEditorWithPortableText(editor, initialValue)
        }
      : undefined,
    namespace: 'RichTextEditor',
    nodes: [
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      ImageNode,
      ListNode,
      ListItemNode,
      HeadingNode,
      QuoteNode,
      TableNode,
      TableCellNode,
      TableRowNode
    ],
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    theme: editorTheme
  }

  const handleEditorChange = useCallback(
    (_editorState: EditorState, editor: LexicalEditor) => {
      const portableText = lexicalToPortableText(editor)
      const jsonString = JSON.stringify(portableText)

      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = jsonString
      }

      if (onChange) {
        onChange(jsonString)
      }
    },
    [onChange]
  )

  if (!isClient) {
    return (
      <div className="rounded border border-border bg-muted/5 p-4">
        <div className="h-32 animate-pulse bg-muted/20" />
      </div>
    )
  }

  return (
    <div>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative rounded border border-border bg-card">
          <ToolbarPlugin />
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="prose prose-theme prose-sm min-h-37.5 max-w-none overflow-auto px-4 py-3 text-foreground outline-none"
                  id={id}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
              placeholder={
                <div className="pointer-events-none absolute top-3 left-4 text-muted-foreground">
                  {placeholder || 'テキストを入力してください...'}
                </div>
              }
            />
          </div>
          <HistoryPlugin />
          <ListPlugin />
          <CodeHighlightPlugin />
          <CodeExitPlugin />
          {autoFocus && <AutoFocusPlugin />}
          <LinkPlugin />
          <ImagePlugin />
          <TablePlugin />
        </div>
        <EditorStatePlugin onChange={handleEditorChange} />
      </LexicalComposer>

      <input
        defaultValue={initialValue || ''}
        name={name}
        ref={hiddenInputRef}
        type="hidden"
      />
    </div>
  )
}
