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
  Eye,
  EyeOff,
  FileCode,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
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
  const [isQuote, setIsQuote] = useState(false)
  const [isCodeBlock, setIsCodeBlock] = useState(false)
  const [blockType, setBlockType] = useState<
    'paragraph' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
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
        setIsQuote(false)
        setIsCodeBlock(false)
      } else if ($isParagraphNode(element)) {
        setBlockType('paragraph')
        setIsQuote(false)
        setIsCodeBlock(false)
      } else if ($isQuoteNode(element)) {
        setBlockType('paragraph')
        setIsQuote(true)
        setIsCodeBlock(false)
      } else if ($isCodeNode(element)) {
        setBlockType('paragraph')
        setIsQuote(false)
        setIsCodeBlock(true)
      } else {
        setBlockType('paragraph')
        setIsQuote(false)
        setIsCodeBlock(false)
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

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (isQuote) {
          // Remove quote formatting by converting to paragraph
          $setBlocksType(selection, () => $createParagraphNode())
        } else {
          // Apply quote formatting using $setBlocksType
          $setBlocksType(selection, () => $createQuoteNode())
        }
      }
    })
  }

  const formatCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (isCodeBlock) {
          // Remove code block formatting by converting to paragraph
          $setBlocksType(selection, () => $createParagraphNode())
        } else {
          // Apply code block formatting using $setBlocksType
          $setBlocksType(selection, () => $createCodeNode())
        }
      }
    })
  }

  const togglePreview = () => {
    if (onPreviewToggle) {
      onPreviewToggle(!showPreview)
    }
  }

  const formatHeading = (
    headingLevel: 'paragraph' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  ) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (headingLevel === 'paragraph') {
          $setBlocksType(selection, () => $createParagraphNode())
        } else {
          $setBlocksType(selection, () => $createHeadingNode(headingLevel))
        }
      }
    })
  }

  return (
    <div className="flex gap-1 border-border border-b bg-muted/5 p-2">
      <div className="relative">
        <select
          aria-label="ブロックタイプ"
          className="appearance-none rounded border border-border bg-card px-3 py-1 pr-8 text-foreground text-sm transition-colors hover:bg-muted/20"
          onChange={(e) =>
            formatHeading(
              e.target.value as 'paragraph' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
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
          isStrikethrough ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
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
          isBulletList ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
        }`}
        onClick={formatBulletList}
        type="button"
      >
        <List className="size-4" />
      </button>
      <button
        aria-label="順序付きリスト"
        className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
          isNumberedList ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
        }`}
        onClick={formatNumberedList}
        type="button"
      >
        <ListOrdered className="size-4" />
      </button>
      <button
        aria-label="引用"
        className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
          isQuote ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
        }`}
        onClick={formatQuote}
        type="button"
      >
        <Quote className="size-4" />
      </button>
      <button
        aria-label="コードブロック"
        className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
          isCodeBlock ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
        }`}
        onClick={formatCodeBlock}
        type="button"
      >
        <FileCode className="size-4" />
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
      <div className="mx-1 w-px bg-border" />
      <button
        aria-label={showPreview ? 'プレビューを隠す' : 'プレビューを表示'}
        className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
          showPreview ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
        }`}
        onClick={togglePreview}
        type="button"
      >
        {showPreview ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
      <input
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageUpload}
        ref={fileInputRef}
        type="file"
      />
    </div>
  )
}
