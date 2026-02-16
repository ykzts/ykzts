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
import type { EditorState, LexicalEditor } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PortableTextPreview } from '../portable-text-preview'
import { ImageNode } from './nodes/image-node'
import { CodeHighlightPlugin } from './plugins/code-highlight-plugin'
import { EditorStatePlugin } from './plugins/editor-state-plugin'
import { ImagePlugin } from './plugins/image-plugin'
import { LinkPlugin } from './plugins/link-plugin'
import { ToolbarPlugin } from './plugins/toolbar-plugin'
import {
  initializeEditorWithPortableText,
  lexicalToPortableText
} from './portable-text-serializer'

const editorTheme = {
  code: 'bg-muted/50 px-1.5 py-0.5 rounded font-mono text-sm',
  codeHighlight: {
    atrule: 'text-purple-600',
    attr: 'text-blue-600',
    boolean: 'text-orange-600',
    builtin: 'text-cyan-600',
    cdata: 'text-gray-600',
    char: 'text-green-600',
    class: 'text-yellow-600',
    'class-name': 'text-yellow-600',
    comment: 'text-gray-500 italic',
    constant: 'text-orange-600',
    deleted: 'text-red-600',
    doctype: 'text-gray-600',
    entity: 'text-orange-600',
    function: 'text-blue-600',
    important: 'text-red-600 font-bold',
    inserted: 'text-green-600',
    keyword: 'text-purple-600',
    namespace: 'text-cyan-600',
    number: 'text-orange-600',
    operator: 'text-gray-700',
    prolog: 'text-gray-600',
    property: 'text-blue-600',
    punctuation: 'text-gray-700',
    regex: 'text-green-600',
    selector: 'text-green-600',
    string: 'text-green-600',
    symbol: 'text-orange-600',
    tag: 'text-red-600',
    url: 'text-blue-600',
    variable: 'text-orange-600'
  },
  heading: {
    h2: 'text-3xl font-bold mb-3',
    h3: 'text-2xl font-bold mb-2',
    h4: 'text-xl font-bold mb-2',
    h5: 'text-lg font-bold mb-1',
    h6: 'text-base font-bold mb-1'
  },
  link: 'text-primary hover:underline',
  list: {
    listitem: 'ml-8',
    nested: {
      listitem: 'list-none'
    },
    ol: 'list-decimal',
    ul: 'list-disc'
  },
  paragraph: 'mb-1',
  quote: 'border-l-4 border-border pl-4 italic text-muted-foreground',
  text: {
    bold: 'font-bold',
    code: 'bg-muted/50 px-1.5 py-0.5 rounded font-mono text-sm',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline'
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
  const [showPreview, setShowPreview] = useState(false)
  const [contentPreview, setContentPreview] = useState<string | undefined>(
    initialValue
  )
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
      QuoteNode
    ],
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    theme: editorTheme
  }

  const handleEditorChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      editorState.read(() => {
        const portableText = lexicalToPortableText(editor)
        const jsonString = JSON.stringify(portableText)

        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = jsonString
        }

        setContentPreview(jsonString)

        if (onChange) {
          onChange(jsonString)
        }
      })
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
        <div
          className={`grid gap-4 ${showPreview ? 'md:grid-cols-2' : 'grid-cols-1'}`}
        >
          <div className="relative rounded border border-border bg-card">
            <ToolbarPlugin
              onPreviewToggle={setShowPreview}
              showPreview={showPreview}
            />
            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="min-h-[150px] overflow-auto px-4 py-3 text-foreground outline-none"
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
            {autoFocus && <AutoFocusPlugin />}
            <LinkPlugin />
            <ImagePlugin />
          </div>
          {showPreview && (
            <div className="rounded border border-border bg-card p-4">
              <h3 className="mb-3 font-medium text-sm">プレビュー</h3>
              <PortableTextPreview value={contentPreview} />
            </div>
          )}
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
