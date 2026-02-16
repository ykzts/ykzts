import {
  PortableText,
  type PortableTextBlockComponent,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import Image from 'next/image'
import type React from 'react'
import { type ComponentProps, Suspense, use } from 'react'
import Link from '@/components/link'
import type {
  CodeBlock,
  ImageBlock,
  PortableTextValue
} from '@/lib/portable-text'
import { highlightCode } from '@/lib/shiki'

// Helper function to extract text content from React children
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }
  if (children && typeof children === 'object' && 'props' in children) {
    const childProps = children.props as { children?: React.ReactNode }
    return extractTextFromChildren(childProps.children)
  }
  return ''
}

// Component to handle code block syntax highlighting
function CodeBlockHighlighter({ children }: { children: React.ReactNode }) {
  const text = extractTextFromChildren(children)
  const htmlPromise = highlightCode(text)
  const html = use(htmlPromise)

  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki generates safe HTML for syntax highlighting
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}

const portableTextComponents = {
  block: {
    code: ((props) => (
      <Suspense
        fallback={
          <pre className="overflow-x-auto rounded-lg bg-muted p-4">
            <code>{extractTextFromChildren(props.children)}</code>
          </pre>
        }
      >
        <CodeBlockHighlighter>{props.children}</CodeBlockHighlighter>
      </Suspense>
    )) satisfies PortableTextBlockComponent
  },
  marks: {
    code({ children }: { children: React.ReactNode }) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
          {children}
        </code>
      )
    },
    link({
      children,
      value
    }: PortableTextMarkComponentProps<{ _type: string; href: string }>) {
      const href = value?.href

      return <Link href={href}>{children}</Link>
    }
  },
  types: {
    async code({ value }: { value: CodeBlock }) {
      const { code, language } = value
      const html = await highlightCode(code, language)

      return (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki generates safe HTML for syntax highlighting
        <div dangerouslySetInnerHTML={{ __html: html }} />
      )
    },
    image({ value }: { value: ImageBlock }) {
      const { alt, asset } = value
      const imageUrl = asset?.url

      if (!imageUrl) {
        return null
      }

      return (
        <figure className="my-8">
          <div className="relative aspect-[4/3] w-full">
            <Image
              alt={alt || ''}
              className="rounded-lg object-contain"
              fill
              sizes="(min-width: 1024px) 800px, 100vw"
              src={imageUrl}
            />
          </div>
          {alt && (
            <figcaption className="mt-2 text-center text-muted-foreground text-sm">
              {alt}
            </figcaption>
          )}
        </figure>
      )
    }
  }
} satisfies Partial<PortableTextReactComponents>

type PortableTextProps = Omit<
  ComponentProps<typeof PortableText>,
  'components'
> & {
  value: PortableTextValue
}

export default function PortableTextBlock({
  value,
  ...props
}: PortableTextProps) {
  return (
    <div className="prose prose-lg max-w-none prose-a:text-primary prose-headings:text-foreground prose-p:text-base prose-p:text-muted-foreground prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
      <PortableText
        {...props}
        components={portableTextComponents}
        value={value}
      />
    </div>
  )
}
