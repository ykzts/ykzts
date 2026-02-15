import {
  PortableText,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import Image from 'next/image'
import type { ComponentProps } from 'react'
import Link from '@/components/link'
import type {
  CodeBlock,
  FootnoteBlock,
  ImageBlock,
  PortableTextValue
} from '@/lib/portable-text'
import { highlightCode } from '@/lib/shiki'

const portableTextComponents = {
  marks: {
    footnoteReference({
      children,
      value
    }: PortableTextMarkComponentProps<{
      _type: string
      identifier: string
    }>) {
      const identifier = value?.identifier

      // Guard: if identifier is missing, render children without link
      if (!identifier) {
        return <>{children}</>
      }

      // Normalize identifier for safe anchor IDs
      const normalizedId = identifier
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')

      return (
        <sup>
          <a
            className="text-primary"
            href={`#fn-${normalizedId}`}
            id={`fnref-${normalizedId}`}
          >
            {children}
          </a>
        </sup>
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
    footnote({ value }: { value: FootnoteBlock }) {
      const { identifier, children } = value

      // Normalize identifier for safe anchor IDs
      const normalizedId = identifier
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')

      return (
        <div className="footnote-definition" id={`fn-${normalizedId}`}>
          <div className="flex gap-2">
            <div className="footnote-label text-muted-foreground">
              [{identifier}]
            </div>
            <div className="footnote-content flex-1">
              {/* 
                Note: GFM doesn't support nested footnote references within definitions.
                The remark-gfm parser prevents this, so no circular reference risk exists.
              */}
              <PortableText
                components={portableTextComponents}
                value={children}
              />
              <a
                aria-label="Back to footnote reference"
                className="footnote-backref ml-1 text-primary text-sm"
                href={`#fnref-${normalizedId}`}
              >
                ↩
              </a>
            </div>
          </div>
        </div>
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
