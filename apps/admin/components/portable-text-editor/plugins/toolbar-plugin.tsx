'use client'

import { $createCodeNode, $isCodeNode } from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  type HeadingNode
} from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND
} from 'lexical'
import {
  Bold,
  ChevronDown,
  Code,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
  Underline
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadImage } from '@/lib/upload-image'
import { INSERT_IMAGE_COMMAND } from './image-plugin'
import { validateUrl } from './link-plugin'

type ToolbarPluginProps = {
  onPreviewToggle?: (show: boolean) => void
  showPreview?: boolean
}

export function ToolbarPlugin(props: ToolbarPluginProps = {}) {
  const { onPreviewToggle, showPreview = false } = props
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const [isBulletList, setIsBulletList] = useState(false)
  const [isNumberedList, setIsNumberedList] = useState(false)
  const [blockType, setBlockType] = useState<
    'paragraph' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'quote' | 'code'
  >('paragraph')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsCode(selection.hasFormat('code'))

      // Check if we're in a link - check both anchor and focus nodes
      const anchorNode = selection.anchor.getNode()
      const focusNode = selection.focus.getNode()
      const anchorParent = anchorNode.getParent()
      const focusParent = focusNode.getParent()
      setIsLink(
        $isLinkNode(anchorNode) ||
          $isLinkNode(anchorParent) ||
          $isLinkNode(focusNode) ||
          $isLinkNode(focusParent)
      )

      // Check if we're in a list - use $getNearestNodeOfType for reliable traversal
      const listNode = $getNearestNodeOfType(anchorNode, ListNode)
      if (listNode) {
        const listType = listNode.getListType()
        setIsBulletList(listType === 'bullet')
        setIsNumberedList(listType === 'number')
      } else {
        setIsBulletList(false)
        setIsNumberedList(false)
      }

      // Check block type (heading or paragraph)
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()

      if ($isHeadingNode(element)) {
        const headingNode = element as HeadingNode
        const tag = headingNode.getTag()
        setBlockType(tag as 'h2' | 'h3' | 'h4' | 'h5' | 'h6')
      } else if ($isParagraphNode(element)) {
        setBlockType('paragraph')
      } else if ($isQuoteNode(element)) {
        setBlockType('quote')
      } else if ($isCodeNode(element)) {
        setBlockType('code')
      } else {
        setBlockType('paragraph')
      }
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      })
    )
  }, [editor, updateToolbar])

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  }

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  }

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
  }

  const formatStrikethrough = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
  }

  const formatCode = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
  }

  const insertLink = useCallback(() => {
    if (!isLink) {
      // TODO: Replace with custom accessible modal in future enhancement
      // Using browser prompt for MVP, but should be replaced with:
      // - Custom modal with proper focus management
      // - Keyboard navigation support
      // - Screen reader announcements
      // - Cancel button
      const url = prompt(
        'リンクのURLを入力してください（例: https://example.com）:'
      )
      if (url && validateUrl(url)) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files || files.length === 0) return

      const file = files[0]
      setIsUploading(true)

      try {
        const result = await uploadImage({ file })

        if (result.error) {
          // TODO: Replace with toast notification in future enhancement
          // Using browser alert for MVP, but should be replaced with:
          // - Toast notification component
          // - Proper error display in the UI
          alert(result.error)
        } else if (result.url) {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: file.name.replace(/\.[^/.]+$/, ''),
            src: result.url
          })
        }
      } catch (error) {
        console.error('Image upload error:', error)
        // TODO: Replace with toast notification in future enhancement
        alert('画像のアップロードに失敗しました。')
      } finally {
        setIsUploading(false)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [editor]
  )

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const formatBulletList = () => {
    if (isBulletList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    }
  }

  const formatNumberedList = () => {
    if (isNumberedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }
  }

  const formatHeading = (
    headingLevel:
      | 'paragraph'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'h5'
      | 'h6'
      | 'quote'
      | 'code'
  ) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (headingLevel === 'paragraph') {
          $setBlocksType(selection, () => $createParagraphNode())
        } else if (headingLevel === 'quote') {
          $setBlocksType(selection, () => $createQuoteNode())
        } else if (headingLevel === 'code') {
          $setBlocksType(selection, () => $createCodeNode())
        } else {
          $setBlocksType(selection, () => $createHeadingNode(headingLevel))
        }
      }
    })
  }

  return (
    <div className="border-border border-b bg-muted/5">
      <div className="flex gap-0 border-border border-b" role="tablist">
        <button
          aria-selected={!showPreview}
          className={`px-4 py-2 text-sm transition-colors ${
            !showPreview
              ? 'border-primary border-b-2 font-medium text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onPreviewToggle?.(false)}
          role="tab"
          tabIndex={!showPreview ? 0 : -1}
          type="button"
        >
          編集
        </button>
        <button
          aria-selected={showPreview}
          className={`px-4 py-2 text-sm transition-colors ${
            showPreview
              ? 'border-primary border-b-2 font-medium text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onPreviewToggle?.(true)}
          role="tab"
          tabIndex={showPreview ? 0 : -1}
          type="button"
        >
          プレビュー
        </button>
      </div>
      {!showPreview && (
        <div className="flex gap-1 p-2">
          <div className="relative">
            <select
              aria-label="ブロックタイプ"
              className="appearance-none rounded border border-border bg-card px-3 py-1 pr-8 text-foreground text-sm transition-colors hover:bg-muted/20"
              onChange={(e) =>
                formatHeading(
                  e.target.value as
                    | 'paragraph'
                    | 'h2'
                    | 'h3'
                    | 'h4'
                    | 'h5'
                    | 'h6'
                    | 'quote'
                    | 'code'
                )
              }
              value={blockType}
            >
              <option value="paragraph">段落</option>
              <option value="h2">見出し2</option>
              <option value="h3">見出し3</option>
              <option value="h4">見出し4</option>
              <option value="h5">見出し5</option>
              <option value="h6">見出し6</option>
              <option value="quote">引用</option>
              <option value="code">コードブロック</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <div className="mx-1 w-px bg-border" />
          <button
            aria-label="太字"
            className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
              isBold ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
            }`}
            onClick={formatBold}
            type="button"
          >
            <Bold className="size-4" />
          </button>
          <button
            aria-label="斜体"
            className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
              isItalic ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
            }`}
            onClick={formatItalic}
            type="button"
          >
            <Italic className="size-4" />
          </button>
          <button
            aria-label="下線"
            className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
              isUnderline ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
            }`}
            onClick={formatUnderline}
            type="button"
          >
            <Underline className="size-4" />
          </button>
          <button
            aria-label="取り消し線"
            className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
              isStrikethrough
                ? 'bg-muted/30 text-primary'
                : 'text-muted-foreground'
            }`}
            onClick={formatStrikethrough}
            type="button"
          >
            <Strikethrough className="size-4" />
          </button>
          <button
            aria-label="インラインコード"
            className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
              isCode ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
            }`}
            onClick={formatCode}
            type="button"
          >
            <Code className="size-4" />
          </button>
          <div className="mx-1 w-px bg-border" />
          <button
            aria-label="リンク"
            className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
              isLink ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
            }`}
            onClick={insertLink}
            type="button"
          >
            <Link2 className="size-4" />
          </button>
          <button
            aria-label="順序なしリスト"
            className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
              isBulletList
                ? 'bg-muted/30 text-primary'
                : 'text-muted-foreground'
            }`}
            onClick={formatBulletList}
            type="button"
          >
            <List className="size-4" />
          </button>
          <button
            aria-label="順序付きリスト"
            className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
              isNumberedList
                ? 'bg-muted/30 text-primary'
                : 'text-muted-foreground'
            }`}
            onClick={formatNumberedList}
            type="button"
          >
            <ListOrdered className="size-4" />
          </button>
          <button
            aria-label="画像"
            className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
              isUploading ? 'cursor-not-allowed opacity-50' : ''
            } text-muted-foreground`}
            disabled={isUploading}
            onClick={triggerImageUpload}
            type="button"
          >
            <Image className="size-4" />
          </button>
          <input
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleImageUpload}
            ref={fileInputRef}
            type="file"
          />
        </div>
      )}
    </div>
  )
}
