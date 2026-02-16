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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ykzts/ui/components/select'
import {
  $createParagraphNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND
} from 'lexical'
import {
  Bold,
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
import { toast } from 'sonner'
import { uploadImage } from '@/lib/upload-image'
import { INSERT_IMAGE_COMMAND } from './image-plugin'
import { LinkDialog } from './link-dialog'

export function ToolbarPlugin() {
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
  const [codeLanguage, setCodeLanguage] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
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
        setCodeLanguage('')
      } else if ($isParagraphNode(element)) {
        setBlockType('paragraph')
        setCodeLanguage('')
      } else if ($isQuoteNode(element)) {
        setBlockType('quote')
        setCodeLanguage('')
      } else if ($isCodeNode(element)) {
        setBlockType('code')
        const language = element.getLanguage() || ''
        setCodeLanguage(language)
      } else {
        setBlockType('paragraph')
        setCodeLanguage('')
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
      setShowLinkDialog(true)
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  const handleLinkConfirm = useCallback(
    (url: string) => {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
    },
    [editor]
  )

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files || files.length === 0) return

      const file = files[0]
      setIsUploading(true)

      try {
        const result = await uploadImage({ file })

        if (result.error) {
          toast.error(result.error)
        } else if (result.url) {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: file.name.replace(/\.[^/.]+$/, ''),
            src: result.url
          })
        }
      } catch (error) {
        console.error('Image upload error:', error)
        toast.error('画像のアップロードに失敗しました。')
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

  const formatBlockType = (
    blockType: 'paragraph' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'quote' | 'code'
  ) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (blockType === 'paragraph') {
          $setBlocksType(selection, () => $createParagraphNode())
        } else if (blockType === 'quote') {
          $setBlocksType(selection, () => $createQuoteNode())
        } else if (blockType === 'code') {
          $setBlocksType(selection, () => $createCodeNode())
        } else {
          $setBlocksType(selection, () => $createHeadingNode(blockType))
        }
      }
    })
  }

  const updateCodeLanguage = (language: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode()
        const element =
          anchorNode.getKey() === 'root'
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow()

        if ($isCodeNode(element)) {
          element.setLanguage(language)
        }
      }
    })
  }

  return (
    <div className="border-border border-b bg-muted/5">
      <div className="flex gap-1 p-2">
        <Select
          onValueChange={(value) => {
            if (value) {
              formatBlockType(
                value as
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
          }}
          value={blockType}
        >
          <SelectTrigger aria-label="ブロックタイプ" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">段落</SelectItem>
            <SelectItem value="h2">見出し2</SelectItem>
            <SelectItem value="h3">見出し3</SelectItem>
            <SelectItem value="h4">見出し4</SelectItem>
            <SelectItem value="h5">見出し5</SelectItem>
            <SelectItem value="h6">見出し6</SelectItem>
            <SelectItem value="quote">引用</SelectItem>
            <SelectItem value="code">コードブロック</SelectItem>
          </SelectContent>
        </Select>
        {blockType === 'code' && (
          <Select
            onValueChange={(value) => updateCodeLanguage(value || '')}
            value={codeLanguage}
          >
            <SelectTrigger aria-label="プログラミング言語" size="sm">
              <SelectValue placeholder="言語を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">言語を選択</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="tsx">TSX</SelectItem>
              <SelectItem value="jsx">JSX</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
              <SelectItem value="ruby">Ruby</SelectItem>
              <SelectItem value="swift">Swift</SelectItem>
              <SelectItem value="kotlin">Kotlin</SelectItem>
              <SelectItem value="bash">Bash</SelectItem>
              <SelectItem value="shell">Shell</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="scss">SCSS</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="plaintext">Plain Text</SelectItem>
            </SelectContent>
          </Select>
        )}
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
      <LinkDialog
        onConfirm={handleLinkConfirm}
        onOpenChange={setShowLinkDialog}
        open={showLinkDialog}
      />
    </div>
  )
}
